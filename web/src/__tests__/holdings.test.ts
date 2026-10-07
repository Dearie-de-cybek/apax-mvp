import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { toPortfolio } from "../controllers/holdingsController";
import { holdingsResponseSchema } from "../types/holdings";

describe("toPortfolio", () => {
  it("returns all three metals at zero for a new account", () => {
    const body = toPortfolio([]);

    assert.deepEqual(body.holdings, { gold: 0, silver: 0, platinum: 0 });
    assert.equal(body.updatedAt, null);
    assert.ok(holdingsResponseSchema.safeParse(body).success);
  });

  it("maps rows by asset and reports the latest update", () => {
    const body = toPortfolio([
      { asset: "gold", amount: 156.75, updatedAt: new Date("2026-10-01T10:00:00Z") },
      { asset: "platinum", amount: 45.2, updatedAt: new Date("2026-10-05T08:30:00Z") },
    ]);

    assert.deepEqual(body.holdings, { gold: 156.75, silver: 0, platinum: 45.2 });
    assert.equal(body.updatedAt, "2026-10-05T08:30:00.000Z");
    assert.ok(holdingsResponseSchema.safeParse(body).success);
  });
});
