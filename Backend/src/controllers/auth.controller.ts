import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/JWT";
import { RegisterUser, LoginUser } from "../types/user";

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body as RegisterUser;

  try {
    // Verificar si el usuario ya existe
    const existingUser = await UserModel.findByEmail(email as string);
    if (existingUser) {
      return res.status(400).json({ message: "Usuario ya existe" });
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(password as string);

    // Crear usuario
    const user = await UserModel.create(
      name as string,
      email as string,
      hashedPassword
    );

    // Generar token
    const token = generateToken(user.id as string);

    res.json({ user, token });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginUser;

  try {
    // Buscar usuario
    const existingUser = await UserModel.findByEmail(email as string);
    if (!existingUser) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Verificar contraseña
    const isPasswordValid = await comparePassword(
      password as string,
      existingUser.password as string
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Generar token
    const token = generateToken(existingUser.id as string);

    res.json({ user: existingUser, token });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
