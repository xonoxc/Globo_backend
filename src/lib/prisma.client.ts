import { PrismaClient } from "@prisma/client"
import { hashPassword } from "./prismaextensions/hasPassword"

const prisma: PrismaClient = new PrismaClient()

prisma.$extends(hashPassword)

export { prisma }
