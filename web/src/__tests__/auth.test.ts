import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import User from "../models/userModel";
import ErrorHandler from "../utils/errorHandler";
import errorMiddleware from "../middlewares/error";
import { isAuthenticatedUser, readBearerToken } from "../middlewares/user_actions/auth";

const SECRET = "test-secret";

before(() => {
  process.env.JWT_SECRET = SECRET;
  process.env.JWT_EXPIRE = "1h";
});

const runAuth = (authorization?: string) =>
  new Promise<unknown>((resolve) => {
    const req = { headers: { authorization } } as Request;
    isAuthenticatedUser(req, {} as Response, resolve);
  });

const toStatus = (err: unknown) => {
  let status = 0;
  const res = {
    status(code: number) {
      status = code;
      return this;
    },
    json() {
      return this;
    },
  } as unknown as Response;
  errorMiddleware(err, {} as Request, res, () => {});
  return status;
};

describe("getJWTToken", () => {
  it("signs the user id and email with JWT_SECRET", () => {
    const user = new User({ name: "Ada", email: "ada@apax.io", gender: "f", password: "longpassword" });

    const payload = jwt.verify(user.getJWTToken(), SECRET) as jwt.JwtPayload;

    assert.equal(payload.id, user._id.toString());
    assert.equal(payload.email, "ada@apax.io");
    assert.ok(payload.exp && payload.iat && payload.exp - payload.iat === 3600);
  });

  it("refuses to sign without a secret", () => {
    const user = new User({ email: "ada@apax.io" });
    delete process.env.JWT_SECRET;
    try {
      assert.throws(() => user.getJWTToken(), /JWT_SECRET/);
    } finally {
      process.env.JWT_SECRET = SECRET;
    }
  });
});

describe("readBearerToken", () => {
  it("reads a bearer token", () => {
    assert.equal(readBearerToken("Bearer abc.def.ghi"), "abc.def.ghi");
  });

  it("ignores other schemes and empty values", () => {
    assert.equal(readBearerToken(undefined), null);
    assert.equal(readBearerToken(""), null);
    assert.equal(readBearerToken("Basic abc"), null);
    assert.equal(readBearerToken("Bearer"), null);
  });
});

describe("isAuthenticatedUser", () => {
  it("rejects a request without a token with 401", async () => {
    const err = await runAuth();
    assert.ok(err instanceof ErrorHandler);
    assert.equal(toStatus(err), 401);
  });

  it("rejects a token signed with another secret with 401", async () => {
    const forged = jwt.sign({ id: "x", email: "x@y.z" }, "not-the-secret");
    assert.equal(toStatus(await runAuth(`Bearer ${forged}`)), 401);
  });

  it("rejects an expired token with 401", async () => {
    const expired = jwt.sign({ id: "x", email: "x@y.z", exp: Math.floor(Date.now() / 1000) - 60 }, SECRET);
    assert.equal(toStatus(await runAuth(`Bearer ${expired}`)), 401);
  });

  it("rejects garbage with 401", async () => {
    assert.equal(toStatus(await runAuth("Bearer not-a-jwt")), 401);
  });
});
