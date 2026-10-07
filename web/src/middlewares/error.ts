import { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler";

const toHttpError = (err: unknown): ErrorHandler => {
  if (err instanceof ErrorHandler) return err;

  if (err instanceof jwt.TokenExpiredError) {
    return new ErrorHandler("Session expired, please log in again", 401);
  }
  if (err instanceof jwt.JsonWebTokenError) {
    return new ErrorHandler("Invalid session, please log in again", 401);
  }
  if (err instanceof mongoose.Error.CastError) {
    return new ErrorHandler(`Invalid ${err.path}`, 400);
  }
  if (err instanceof mongoose.Error.ValidationError) {
    const message = Object.values(err.errors).map((e) => e.message).join(", ");
    return new ErrorHandler(message, 400);
  }

  return new ErrorHandler("Internal server error", 500);
};

const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  const httpError = toHttpError(err);

  if (httpError.statusCode >= 500) {
    console.error(err);
  }

  res.status(httpError.statusCode).json({
    success: false,
    message: httpError.message,
  });
};

export default errorMiddleware;
