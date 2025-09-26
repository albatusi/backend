import { Router } from "express";
import { getVehicles, createVehicle } from "../controllers/vehicle.controller.js";

const router = Router();

router.get("/", getVehicles);
router.post("/", createVehicle);

export default router;
