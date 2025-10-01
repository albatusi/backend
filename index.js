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
// En producción restringe origin: { origin: 'https://tu-frontend.com' }
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Debug: logger de todas las peticiones entrantes (útil en Render logs)
app.use((req, res, next) => {
  console.log(`[INCOMING] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// --- Rutas ---
// Monta las rutas de autenticación bajo /api/auth
app.use("/api/auth", authRoutes);

// Monta las rutas de vehículos bajo /api/vehicles
app.use("/api/vehicles", vehicleRoutes);

// Endpoint de prueba (ping)
app.get("/api/ping", (req, res) => {
  res.json({ message: "Backend conectado 🚀" });
});

// Diagnóstico: ping directo para /api/vehicles (temporal)
app.get("/api/vehicles/__ping", (req, res) => {
  res.json({ ok: true, msg: "api vehicles ping OK" });
});

// Diagnóstico: listar rutas registradas (útil para debug en Render)
function listRegisteredRoutes() {
  const routes = [];
  if (!app._router) return routes;
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods).join(",").toUpperCase();
      routes.push({ path: middleware.route.path, methods });
    } else if (middleware.name === "router" && middleware.handle && middleware.handle.stack) {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods).join(",").toUpperCase();
          routes.push({ path: handler.route.path, methods });
        }
      });
    }
  });
  return routes;
}

app.get("/_routes", (req, res) => {
  try {
    const r = listRegisteredRoutes();
    return res.json({ ok: true, routes: r });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
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

  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
