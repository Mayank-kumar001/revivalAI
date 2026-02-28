import express from "express"
import { heathCheck } from "../controllers/healthCheck.controller.js";

export const healthCheckRouter = express.Router();

healthCheckRouter.get("/", heathCheck);
