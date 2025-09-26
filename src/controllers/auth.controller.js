import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// --- REGISTRO ---
export const register = async (req, res) => {
  try {
    const { nombre, documento, rol, email, password } = req.body;

    // Verificar si ya existe el correo o documento
    const existingUser = await prisma.usuarios.findFirst({
      where: {
        OR: [{ emaUsuario: email }, { docUsuario: documento }],
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "El correo o documento ya está registrado" });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.usuarios.create({
      data: {
        nomUsuario: nombre,
        docUsuario: documento,
        emaUsuario: email,
        pasUsuario: hashedPassword,
        rol_idUsuario: rol || 3, // Si no envían rol, se asigna "Usuario" (id=3)
      },
      include: { roles: true }, // Para traer el nombre del rol
    });

    res.status(201).json({
      message: "Usuario registrado con éxito",
      user: {
        id: user.idUsuario,
        nombre: user.nomUsuario,
        email: user.emaUsuario,
        rol: user.roles.nomRol, // viene de la tabla roles
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
};

// --- LOGIN ---
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await prisma.usuarios.findUnique({
      where: { emaUsuario: email },
      include: { roles: true }, // Para traer también el rol
    });

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.pasUsuario);
    if (!isMatch)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    // Crear token
    const token = jwt.sign(
      { id: user.idUsuario, rol: user.roles.nomRol },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.idUsuario,
        nombre: user.nomUsuario,
        email: user.emaUsuario,
        rol: user.roles.nomRol, // nombre del rol
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};
