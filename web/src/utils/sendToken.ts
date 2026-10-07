import { Response } from "express";
import { IUser } from "../models/userModel";
import { LoginResponse } from "../types/auth";

const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const body: LoginResponse = {
    success: true,
    token: user.getJWTToken(),
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };

  res.status(statusCode).json(body);
};

export default sendToken;
