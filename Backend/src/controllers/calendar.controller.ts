import { Request, Response } from "express";
import { CalendarModel } from "../models/calendar.model";
import { AuthRequest } from "../middlewares/user.middleware";

export const CalendarController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const events = await CalendarModel.getByUserId(req.userId!);
      res.json(events);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message || "Error al obtener eventos" });
    }
  },
  async getByClientId(req: AuthRequest, res: Response) {
    try {
      const { client_id } = req.params;
      const events = await CalendarModel.getByClientId(client_id);
      res.json(events);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message || "Error al buscar eventos" });
    }
  },
  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const event = await CalendarModel.getById(id);

      if (!event) {
        return res.status(404).json({ error: "Evento no encontrado" });
      }
      res.json(event);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message || "Error al buscar evento" });
    }
  },
  async addEvent(req: AuthRequest, res: Response) {
    try {
      const event = req.body;
      const newEvent = await CalendarModel.addEvent(event);
      res.status(201).json(newEvent);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message || "Error al crear el evento" });
    }
  },
  async deleteEvent(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const deletedEvent = await CalendarModel.deleteEvent(id);
      if (!deletedEvent) {
        return res.status(404).json({ error: " Evento no encontrado" });
      }
      res.status(200).json({ message: "Evento eliminado correctamente" });
    } catch (error: any ) {
      res.status(500).json({ error: error?.message || "Error al eliminar el evento"});
    }
  },

  async updateEvent(req: AuthRequest, res: Response){
    try {
      const { id } = req.params;
      const updateEvent = req.body;

      const updatedEvent = await CalendarModel.updateEventById(id, updateEvent);
      if (!updatedEvent) {
        return res.status(404).json({ error: "Evento no encontrado" });
      }
      res.status(200).json({ message: "Evento actualizado correctamente" });
    } catch (error: any ) {
      res.status(500).json({ error: error?.message || "Error al actualizar el evento"});
    }
  }
};
