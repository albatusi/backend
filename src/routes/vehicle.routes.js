import { Router } from "express";
import { 
    getVehicles, 
    createVehicle, 
    updateVehicle,  // ⬅️ Agregada la función de actualización
    deleteVehicle   // ⬅️ Agregada la función de eliminación
} from "../controllers/vehicle.controller.js"; // Asegúrate de que esta ruta sea correcta

const router = Router();

// ===================================
// Rutas base: /api/vehicles
// ===================================

router.get("/", getVehicles);      // GET /api/vehicles -> Obtener todos
router.post("/", createVehicle);     // POST /api/vehicles -> Crear uno nuevo

// ===================================
// Rutas con parámetro ID: /api/vehicles/:id
// ===================================

router.put("/:id", updateVehicle);   // PUT /api/vehicles/:id -> Actualizar por ID
router.delete("/:id", deleteVehicle); // DELETE /api/vehicles/:id -> Eliminar por ID

export default router;