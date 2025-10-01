import prisma from "../lib/prisma.client.js";
import { Prisma } from "@prisma/client";

/**
 * Helper: intenta localizar el modelo de "vehicle" dentro del Prisma Client.
 * Busca claves que contengan "veh" o "vehicle" (case-insensitive) y devuelve
 * el primer match. Si no encuentra ninguno, devuelve null.
 */
function getVehicleModel() {
  try {
    const keys = Object.keys(prisma);
    // Filtrar propiedades que probablemente sean modelos (evitar metodos como $connect)
    const candidate = keys.find((k) => /veh(icul|ic)?/i.test(k));
    if (candidate) {
      console.log(`[DEBUG] Usando modelo Prisma: ${candidate}`);
      // @ts-ignore dinámico
      return prisma[candidate];
    }
    // Si no hay candidatas claras, devolver null y permitir manejo superior
    console.warn("[WARN] No se encontró un modelo con 'veh' en Prisma. Modelos disponibles:", keys);
    return null;
  } catch (err) {
    console.error("Error detectando modelos en Prisma:", err);
    return null;
  }
}

// ==============================
// 1. OBTENER VEHÍCULOS (GET)
// ==============================
export const getVehicles = async (req, res) => {
  try {
    const model = getVehicleModel();
    if (!model) {
      const available = Object.keys(prisma).filter(k => !k.startsWith('$'));
      return res.status(500).json({
        message:
          "Modelo de vehículos no encontrado en Prisma. Revisa tu schema.prisma y regenera el cliente.",
        availableModels: available,
      });
    }

    const vehicles = await model.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.json(vehicles);
  } catch (error) {
    console.error("❌ Error al obtener vehículos:", error);
    return res.status(500).json({ message: "Fallo del servidor al obtener vehículos." });
  }
};

// ==============================
// 2. CREAR VEHÍCULO (POST)
// ==============================
export const createVehicle = async (req, res) => {
  try {
    const model = getVehicleModel();
    if (!model) {
      const available = Object.keys(prisma).filter(k => !k.startsWith('$'));
      return res.status(500).json({
        message:
          "Modelo de vehículos no encontrado en Prisma. Revisa tu schema.prisma y regenera el cliente.",
        availableModels: available,
      });
    }

    const { name, plate, type, facePhoto } = req.body;

    if (!name || !plate) {
      return res.status(400).json({ message: "El nombre y la placa son obligatorios." });
    }

    const plateUpper = String(plate).toUpperCase();

    const newVehicle = await model.create({
      data: {
        name,
        plate: plateUpper,
        type: type || "carro",
        facePhoto: facePhoto || null,
      },
    });

    return res.status(201).json(newVehicle);
  } catch (error) {
    // Manejo de error P2002 (duplicado) si aplica
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(400).json({ message: "La placa ya está registrada." });
    }
    console.error("❌ Error al crear vehículo:", error);
    return res.status(500).json({ message: "Fallo del servidor al registrar el vehículo." });
  }
};

// ==============================
// 3. ACTUALIZAR VEHÍCULO (PUT)
// ==============================
export const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const { name, plate, type, facePhoto } = req.body;

  const vehicleId = parseInt(id, 10);
  if (Number.isNaN(vehicleId)) {
    return res.status(400).json({ message: "ID de vehículo inválido o faltante en la URL." });
  }

  const dataToUpdate = {};
  if (name !== undefined) dataToUpdate.name = name;
  if (plate !== undefined) dataToUpdate.plate = String(plate).toUpperCase();
  if (type !== undefined) dataToUpdate.type = type;
  if (facePhoto !== undefined) dataToUpdate.facePhoto = facePhoto || null;

  try {
    const model = getVehicleModel();
    if (!model) {
      const available = Object.keys(prisma).filter(k => !k.startsWith('$'));
      return res.status(500).json({
        message:
          "Modelo de vehículos no encontrado en Prisma. Revisa tu schema.prisma y regenera el cliente.",
        availableModels: available,
      });
    }

    const updatedVehicle = await model.update({
      where: { id: vehicleId },
      data: dataToUpdate,
    });

    return res.json(updatedVehicle);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ message: `Vehículo con ID ${id} no encontrado.` });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(400).json({ message: "La nueva placa ya está registrada por otro vehículo." });
    }
    console.error("❌ Error al actualizar vehículo:", error);
    return res.status(500).json({ message: "Fallo del servidor al actualizar." });
  }
};

// ==============================
// 4. ELIMINAR VEHÍCULO (DELETE)
// ==============================
export const deleteVehicle = async (req, res) => {
  const { id } = req.params;
  const vehicleId = parseInt(id, 10);
  if (Number.isNaN(vehicleId)) {
    return res.status(400).json({ message: "ID de vehículo inválido o faltante en la URL." });
  }

  try {
    const model = getVehicleModel();
    if (!model) {
      const available = Object.keys(prisma).filter(k => !k.startsWith('$'));
      return res.status(500).json({
        message:
          "Modelo de vehículos no encontrado en Prisma. Revisa tu schema.prisma y regenera el cliente.",
        availableModels: available,
      });
    }

    await model.delete({
      where: { id: vehicleId },
    });

    return res.status(200).json({ message: "Vehículo eliminado con éxito." });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ message: `Vehículo con ID ${id} no encontrado.` });
    }
    console.error("❌ Error al eliminar vehículo:", error);
    return res.status(500).json({ message: "Fallo del servidor al eliminar." });
  }
};
