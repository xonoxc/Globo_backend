import { PrismaClient } from "@prisma/client"
import { env } from "../utils/validation/env.validation"

const prisma: PrismaClient = new PrismaClient(
     env.NODE_ENV === "development"
          ? {
                 log: ["info", "warn", "error"],
            }
          : undefined
)

export { prisma }
