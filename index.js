import express from "express";
import dotenv from "dotenv";
import cors from "cors";
// Asegúrate de que estos archivos existan
import authRoutes from "./src/routes/auth.routes.js";
import vehicleRoutes from "./src/routes/vehicle.routes.js";
import prisma from "./src/lib/prisma.client.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
// Límite aumentado a '50mb' para manejar Data URLs de fotos grandes.
app.use(express.json({ limit: "50mb" }));

// --- Rutas ---
// Monta las rutas de autenticación bajo /api/auth
app.use("/api/auth", authRoutes);

// Monta las rutas de vehículos bajo /api/vehicles
app.use("/api/vehicles", vehicleRoutes);

// Endpoint de prueba (cambiado a /api/ping para ser general)
app.get("/api/ping", (req, res) => {
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