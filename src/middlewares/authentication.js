import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { UnAuthorizedError } from "../lib/appErrors.js";
import userModel from "../models/userModel.js";

export const authentication = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) throw new UnAuthorizedError("Missing token");

    const token = authorization.replace("Bearer ", "");

    const decoded = jwt.verify(token, env.jwt_key);
    if (!decoded)
      throw new UnAuthorizedError("Invalid token, user is not authorized");

    const user = await userModel.findById(decoded._id);

    if (!user) throw new UnAuthorizedError("User is not authorized");

    // Check if decoded token matches user token
    if (decoded.token !== user.token) {
      throw new UnAuthorizedError(
        "Invalid token, user is not authorized login again"
      );
    }

    if (user.acctstatus === "suspended")
      throw new UnAuthorizedError("Account suspended");

    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    console.log(err);
    throw new UnAuthorizedError(err.message || "User is not authorized");
  }
};

export const dbconnection = (req, res, next) => {
  req.dbConnection = secondDb;

  next();
};
