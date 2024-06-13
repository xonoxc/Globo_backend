import { PrismaClient } from "@prisma/client"
import { hashPassword } from "./prismaextensions/hasPassword"
import { excludePassword } from "./prismaextensions/exclude.password"

const prisma: PrismaClient = new PrismaClient()

prisma.$extends(hashPassword).$extends(excludePassword)

export { prisma }
