import express, { Router } from "express";
import { getMyHoldings } from "../controllers/holdingsController";
import { isAuthenticatedUser } from "../middlewares/user_actions/auth";

const router: Router = express.Router();

router.get("/", isAuthenticatedUser, getMyHoldings);

export default router;
