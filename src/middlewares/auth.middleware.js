// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import "dotenv/config"; // Para cargar las variables de entorno

/**
 * Middleware para verificar la validez de un token JWT.
 * * Este middleware se usa para proteger rutas que solo deben ser accesibles
 * por usuarios autenticados.
 *
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {function} next - Función para pasar el control al siguiente middleware.
 */
const verifyToken = (req, res, next) => {
  // 1. Obtener el token del encabezado de autorización
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

  // 2. Si no hay token, denegar el acceso
  if (!token) {
    return res.status(401).json({ message: "Se requiere un token para la autenticación" });
  }

  // 3. Verificar el token usando la clave secreta
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Adjuntar la información del usuario al objeto de la solicitud
    req.user = decoded;
    
    // 5. Pasar el control al siguiente middleware o a la función de la ruta
    next();
  } catch (err) {
    // Si el token es inválido (expirado, modificado, etc.), devolver un error
    return res.status(403).json({ message: "Token inválido" });
  }
};

export default verifyToken;