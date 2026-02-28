import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

const connectionString = `${process.env.DATABASE_URL}`;
const globalForPrima = globalThis;

const adapter = new PrismaPg({ connectionString });
export const db = globalForPrima.prisma || new PrismaClient({ adapter });
if(process.env.NODE_ENV !== "production") globalForPrima.prisma = db;

