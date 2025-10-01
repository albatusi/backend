import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import prisma from "./src/lib/prisma.client.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// debug logger
app.use((req, res, next) => {
  console.log(`[INCOMING] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

let vehicleMounted = false;

async function mountRouters() {
  // auth
  try {
    const mod = await import("./src/routes/auth.routes.js");
    const authRoutes = mod.default || mod;
    app.use("/api/auth", authRoutes);
    console.log("✅ Mounted /api/auth");
  } catch (err) {
    console.error("❌ Error mounting /api/auth:", err && err.stack ? err.stack : err);
  }

  // vehicles
  try {
    const mod = await import("./src/routes/vehicle.routes.js");
    const vehicleRoutes = mod.default || mod;
    app.use("/api/vehicles", vehicleRoutes);
    vehicleMounted = true;
    console.log("✅ Mounted /api/vehicles");
  } catch (err) {
    console.error("❌ Error mounting /api/vehicles:", err && err.stack ? err.stack : err);
  }
}

// monta routers asincrónicamente pero antes de escuchar peticiones
mountRouters().catch((e) => {
  console.error("Error in mountRouters:", e && e.stack ? e.stack : e);
});

// ping simple
app.get("/api/ping", (req, res) => res.json({ message: "Backend conectado 🚀" }));

// diagnostic ping for vehicles mount
app.get("/api/vehicles/__ping", (req, res) => {
  if (vehicleMounted) return res.json({ ok: true, msg: "api vehicles ping OK", mounted: true });
  return res.status(500).json({ ok: false, msg: "api vehicles NOT mounted", mounted: false });
});

// lista rutas registradas (útil para debug)
function listRegisteredRoutes() {
  const results = [];
  if (!app._router) return results;
  app._router.stack.forEach((layer) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(",").toUpperCase();
      results.push({ mount: "/", path: layer.route.path, methods });
    } else if (layer.name === "router" && layer.handle && layer.regexp) {
      let mountPath = "/";
      try {
        const m = String(layer.regexp).match(/\\\/[a-z0-9-_\\\/]*/i);
        if (m && m[0]) mountPath = m[0].replace(/\\\//g, "/");
      } catch (e) {}
      layer.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods).join(",").toUpperCase();
          results.push({ mount: mountPath, path: handler.route.path, methods });
        }
      });
    }
  });
  return results;
}
app.get("/_routes", (req, res) => {
  try {
    return res.json({ ok: true, routes: listRegisteredRoutes() });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log("✅ Conectado a MySQL con Prisma");
  } catch (err) {
    console.error("❌ Error al conectar a MySQL:", err && err.stack ? err.stack : err);
  }
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
