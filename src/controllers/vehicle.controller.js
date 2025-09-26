import Vehicle from "../models/Vehicle.js";

export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate("owner", "name email");
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ msg: "Error obteniendo vehículos" });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const { plate, brand, type, owner } = req.body;
    const newVehicle = new Vehicle({ plate, brand, type, owner });
    await newVehicle.save();
    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(500).json({ msg: "Error creando vehículo", error: err.message });
  }
};
