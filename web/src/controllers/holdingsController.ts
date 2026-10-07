import { Response } from "express";
import Holding from "../models/holdingModel";
import asyncErrorHandler from "../middlewares/helpers/asyncErrorHandler";
import { AuthenticatedRequest } from "../middlewares/user_actions/auth";
import { HoldingsResponse, Metal } from "../types/holdings";

type HoldingRow = { asset: Metal; amount: number; updatedAt: Date };

export const toPortfolio = (rows: HoldingRow[]): HoldingsResponse => {
  const holdings = { gold: 0, silver: 0, platinum: 0 };
  let latest: Date | null = null;

  for (const row of rows) {
    holdings[row.asset] = row.amount;
    if (!latest || row.updatedAt > latest) latest = row.updatedAt;
  }

  return {
    success: true,
    unit: "g",
    holdings,
    updatedAt: latest ? latest.toISOString() : null,
  };
};

export const getMyHoldings = asyncErrorHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const rows = await Holding.find({ user: req.user?._id })
      .select("asset amount updatedAt")
      .lean<HoldingRow[]>();

    res.status(200).json(toPortfolio(rows));
  }
);
