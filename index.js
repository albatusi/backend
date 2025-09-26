import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./src/routes/auth.routes.js";
// ✅ CORREGIDO: Importamos la instancia única de Prisma
import prisma from "./src/lib/prisma.client.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Para fotos en base64

// Rutas
app.use("/api/auth", authRoutes);

// Endpoint de prueba
app.get("/api/auth/ping", (req, res) => {
  res.json({ message: "Backend conectado 🚀" });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    // Probar conexión a MySQL
    await prisma.$connect();
    console.log("✅ Conectado a MySQL con Prisma");
  } catch (err) {
    console.error("❌ Error al conectar a MySQL:", err);
  }

  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
