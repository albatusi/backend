import { Router } from "express";
// ✅ Importa la única instancia de Prisma
import prisma from "../lib/prisma.client.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import verifyToken from "../middlewares/auth.middleware.js";

// --- Importaciones para el 2FA ---
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

// --- Importaciones para la subida de imágenes ---
import cloudinary from "cloudinary";
import multer from "multer";

const router = Router();

// Configuración de Cloudinary (para subir imágenes).
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @route POST /register
 * @desc Registra un nuevo usuario en la base de datos y genera el código QR para el 2FA.
 */
router.post("/register", upload.single("profilePhoto"), async (req, res) => {
  try {
    const { name, document, role, email, password } = req.body;

    // --- Validación de datos ---
    if (!name || !document || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Comprueba existencia de usuario por email y documento (email y doc son únicos en schema)
    const existingUser = await prisma.usuarios.findUnique({
      where: { emaUsuario: email },
    });
    if (existingUser) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const existingDoc = await prisma.usuarios.findUnique({
      where: { docUsuario: document },
    });
    if (existingDoc) {
      return res.status(400).json({ message: "El documento ya está registrado" });
    }

    // --- Subida de imagen a Cloudinary ---
    let photoUrl = null;
    if (req.file) {
      try {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const result = await cloudinary.v2.uploader.upload(dataURI);
        photoUrl = result.secure_url;
      } catch (err) {
        console.error("Error subiendo imagen a Cloudinary:", err);
        return res.status(500).json({ message: "Error al subir la imagen" });
      }
    }

    // --- Hashing de la contraseña ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- Lógica para asegurar que el rol 'Usuario' existe antes de registrar ---
    // Usamos findFirst porque en tu schema `nomRol` no tiene @unique
    let usuarioRol = await prisma.roles.findFirst({
      where: { nomRol: "Usuario" },
    });

    if (!usuarioRol) {
      usuarioRol = await prisma.roles.create({
        data: { nomRol: "Usuario" },
      });
      console.log("✅ Rol 'Usuario' creado automáticamente.");
    }

    const rolIdInt = usuarioRol.idRol;

    // --- Lógica de 2FA (Paso 1: Generación) ---
    const secret = new OTPAuth.Secret();

    // Creamos usuario y devolvemos solo campos seguros (no pasUsuario ni secret2FA)
    const user = await prisma.usuarios.create({
      data: {
        nomUsuario: name,
        docUsuario: document,
        emaUsuario: email,
        pasUsuario: hashedPassword,
        rol_idUsuario: rolIdInt,
        photoUrl: photoUrl,
        secret2FA: secret.base32,
      },
      select: {
        idUsuario: true,
        nomUsuario: true,
        docUsuario: true,
        emaUsuario: true,
        photoUrl: true,
        fecha_creacionUsuario: true,
        habilitado2FA: true,
        rol: { select: { nomRol: true } },
      },
    });

    const totp = new OTPAuth.TOTP({
      issuer: "TuProyectoApp",
      label: email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secret,
    });

    const otpauthURL = totp.toString();
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthURL);

    res.status(201).json({
      message: "✅ Usuario registrado con éxito. Por favor, escanea el QR para activar el 2FA.",
      user,
      qrCodeDataUrl,
    });
  } catch (err) {
    console.error("❌ Error en /register:", err);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
});

/**
 * @route POST /verify-2fa
 * @desc Verifica el código 2FA ingresado por el usuario y activa la función en la base de datos.
 */
router.post("/verify-2fa", async (req, res) => {
  try {
    const { email, twoFactorCode } = req.body;

    if (!email || !twoFactorCode) {
      return res.status(400).json({ message: "Correo y código 2FA son requeridos" });
    }

    const user = await prisma.usuarios.findUnique({
      where: { emaUsuario: email },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (user.habilitado2FA) {
      return res.status(200).json({ message: "2FA ya está activado para este usuario." });
    }

    if (!user.secret2FA) {
      return res.status(400).json({ message: "No hay secret2FA guardado para este usuario" });
    }

    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(user.secret2FA),
      issuer: "TuProyectoApp",
      label: email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
    });

    const delta = totp.validate({ token: twoFactorCode, window: 1 });

    if (delta === null) {
      return res.status(401).json({ message: "Código 2FA inválido." });
    }

    await prisma.usuarios.update({
      where: { idUsuario: user.idUsuario },
      data: { habilitado2FA: true },
    });

    res.status(200).json({ message: "✅ 2FA activado exitosamente." });
  } catch (err) {
    console.error("❌ Error en /verify-2fa:", err);
    res.status(500).json({ message: "Error interno del servidor al verificar 2FA." });
  }
});

/**
 * @route POST /login
 * @desc Autentica a un usuario y le devuelve un token JWT o solicita el código 2FA.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Correo y contraseña son requeridos" });
    }

    const user = await prisma.usuarios.findUnique({
      where: { emaUsuario: email },
    });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.pasUsuario);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    if (user.habilitado2FA) {
      return res.status(200).json({
        message: "Verificación de dos pasos requerida",
        requires2FA: true,
        email: user.emaUsuario,
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET no definido");
      return res.status(500).json({ message: "Server misconfigured: missing JWT_SECRET" });
    }

    const token = jwt.sign(
      { idUsuario: user.idUsuario, email: user.emaUsuario },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Devolver usuario sin datos sensibles
    const userSafe = await prisma.usuarios.findUnique({
      where: { idUsuario: user.idUsuario },
      select: {
        nomUsuario: true,
        docUsuario: true,
        emaUsuario: true,
        photoUrl: true,
        rol: { select: { nomRol: true } },
        habilitado2FA: true,
      },
    });

    res.json({ message: "✅ Login exitoso", token, user: userSafe });
  } catch (err) {
    console.error("❌ Error en /login:", err);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
});

/**
 * @route POST /verify-login-2fa
 * @desc Verifica el código 2FA ingresado por el usuario y le devuelve un token JWT para iniciar sesión.
 */
router.post("/verify-login-2fa", async (req, res) => {
  try {
    const { email, twoFactorCode } = req.body;

    if (!email || !twoFactorCode) {
      return res.status(400).json({ message: "Correo y código 2FA son requeridos" });
    }

    const user = await prisma.usuarios.findUnique({
      where: { emaUsuario: email },
    });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (!user.habilitado2FA || !user.secret2FA) {
      return res.status(400).json({ message: "2FA no está habilitado para este usuario" });
    }

    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(user.secret2FA),
      issuer: "TuProyectoApp",
      label: email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
    });

    const delta = totp.validate({ token: twoFactorCode, window: 1 });

    if (delta === null) {
      return res.status(401).json({ message: "Código 2FA inválido" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET no definido");
      return res.status(500).json({ message: "Server misconfigured: missing JWT_SECRET" });
    }

    const token = jwt.sign(
      { idUsuario: user.idUsuario, email: user.emaUsuario },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const userWithRole = await prisma.usuarios.findUnique({
      where: { idUsuario: user.idUsuario },
      select: {
        nomUsuario: true,
        docUsuario: true,
        emaUsuario: true,
        photoUrl: true,
        rol: {
          select: {
            nomRol: true,
          },
        },
        habilitado2FA: true,
      },
    });

    res.status(200).json({ message: "✅ Autenticación 2FA exitosa", token, user: userWithRole });
  } catch (err) {
    console.error("❌ Error al verificar 2FA:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/**
 * @route GET /profile
 * @desc Obtiene los datos del perfil del usuario autenticado.
 */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    if (!req.user || !req.user.idUsuario) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const user = await prisma.usuarios.findUnique({
      where: { idUsuario: req.user.idUsuario },
      select: {
        nomUsuario: true,
        docUsuario: true,
        emaUsuario: true,
        photoUrl: true,
        rol: {
          select: {
            nomRol: true,
          },
        },
        habilitado2FA: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Perfil no encontrado" });
    }

    res.json({ message: "✅ Perfil cargado con éxito", user });
  } catch (err) {
    console.error("❌ Error en /profile:", err);
    res.status(500).json({ message: "Error al obtener el perfil" });
  }
});

/**
 * @route GET /ping
 * @desc Ruta de prueba para verificar si el servidor responde.
 */
router.get("/ping", (req, res) => {
  res.status(200).json({ message: "pong" });
});

export default router;
