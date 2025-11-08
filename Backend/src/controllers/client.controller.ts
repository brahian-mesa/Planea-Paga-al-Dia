import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/user.middleware";
import { ClientModel } from "../models/client.model";

export const getClients = async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await ClientModel.getByUserId(req.userId!);
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error al obtener clientes", error: err.message });
  }
};

export const getClient = async (req: Request, res: Response) => {
  try {
    const { data, error } = await ClientModel.getById(req.params.id);
    if (error || !data)
      return res.status(404).json({ message: "Cliente no encontrado" });
    res.json(data);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error al obtener cliente", error: err.message });
  }
};

export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const { nombre, nit, tipo_client } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!nombre) {
      return res.status(400).json({
        message: "Error al crear cliente",
        error: "El campo 'nombre' es requerido",
        hint: "Asegúrate de enviar { nombre, nit, tipo_client } en el body"
      });
    }

    const client = {
      user_id: req.userId!,
      nombre,
      nit,
      tipo_client,
    };
    const { data, error } = await ClientModel.create(client);
    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error al crear cliente", error: err.message });
  }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const client = req.body;
    const { data, error } = await ClientModel.update(id, client);
    if (error) throw error;
    if (!data)
      return res.status(404).json({ message: "Cliente no encontrado" });
    res.json(data);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error al actualizar cliente", error: err.message });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await ClientModel.delete(id);
    if (error) throw error;
    res.json({ message: "Cliente eliminado correctamente", data });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error al eliminar cliente", error: err.message });
  }
};
