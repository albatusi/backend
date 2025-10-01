import prisma from "../lib/prisma.client.js";
import { Prisma } from "@prisma/client"; // Necesario para el manejo de errores de Prisma

// ===================================
// 1. OBTENER VEHÍCULOS (GET /api/vehicles)
// ===================================
export const getVehicles = async (req, res) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(vehicles);
    } catch (error) {
        console.error("❌ Error al obtener vehículos:", error);
        res.status(500).json({ message: "Fallo del servidor al obtener vehículos." });
    }
};

// ===================================
// 2. CREAR VEHÍCULO (POST /api/vehicles)
// ===================================
export const createVehicle = async (req, res) => {
    try {
        const { name, plate, type, facePhoto, ownerId } = req.body; 
        
        if (!name || !plate) {
            return res.status(400).json({ message: "El nombre y la placa son obligatorios." });
        }
        
        const plateUpper = plate.toUpperCase();

        // Intenta crear el vehículo
        const newVehicle = await prisma.vehicle.create({
            data: { 
                name, 
                plate: plateUpper, 
                type: type || 'carro', // Asume 'carro' si no se envía y el campo es opcional
                facePhoto: facePhoto || null,
                // ownerId: ownerId, // Descomentar si usas la relación
            }
        });

        res.status(201).json(newVehicle);

    } catch (error) {
        // Manejo de error de placa duplicada (código P2002 de Prisma)
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
             return res.status(400).json({ message: "La placa ya está registrada." });
        }
        console.error("❌ Error al crear vehículo:", error);
        res.status(500).json({ message: "Fallo del servidor al registrar el vehículo." });
    }
};

// ===================================
// 3. ACTUALIZAR VEHÍCULO (PUT /api/vehicles/:id)
// ===================================
export const updateVehicle = async (req, res) => {
    const { id } = req.params;
    const { name, plate, type, facePhoto } = req.body;
    
    // 🎯 Solución: Validar la conversión del ID y evitar el fallo genérico
    const vehicleId = parseInt(id);

    if (isNaN(vehicleId)) {
        return res.status(400).json({ message: "ID de vehículo inválido o faltante en la URL." });
    }
    
    // Construir objeto de datos a actualizar, solo con campos presentes
    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (plate !== undefined) dataToUpdate.plate = plate.toUpperCase();
    if (type !== undefined) dataToUpdate.type = type;
    if (facePhoto !== undefined) dataToUpdate.facePhoto = facePhoto || null;


    try {
        const updatedVehicle = await prisma.vehicle.update({
            where: { id: vehicleId }, // Usamos el ID validado
            data: dataToUpdate
        });
        res.json(updatedVehicle);
    } catch (error) {
        // Manejo de error de registro no encontrado (código P2025)
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ message: `Vehículo con ID ${id} no encontrado.` });
        }
        // Manejo de error de placa duplicada al actualizar (código P2002)
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(400).json({ message: "La nueva placa ya está registrada por otro vehículo." });
        }
        console.error("❌ Error al actualizar vehículo:", error);
        res.status(500).json({ message: "Fallo del servidor al actualizar." });
    }
};

// ===================================
// 4. ELIMINAR VEHÍCULO (DELETE /api/vehicles/:id)
// ===================================
export const deleteVehicle = async (req, res) => {
    const { id } = req.params;
    
    // 🎯 Solución: Validar la conversión del ID y evitar el fallo genérico
    const vehicleId = parseInt(id);

    if (isNaN(vehicleId)) {
        return res.status(400).json({ message: "ID de vehículo inválido o faltante en la URL." });
    }

    try {
        await prisma.vehicle.delete({
            where: { id: vehicleId }, // Usamos el ID validado
        });
        res.status(200).json({ message: "Vehículo eliminado con éxito." });
    } catch (error) {
        // Manejo de error de registro no encontrado (código P2025)
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ message: `Vehículo con ID ${id} no encontrado.` });
        }
        console.error("❌ Error al eliminar vehículo:", error);
        res.status(500).json({ message: "Fallo del servidor al eliminar." });
    }
};