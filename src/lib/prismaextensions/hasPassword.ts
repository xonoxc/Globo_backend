import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"

export const hashPassword = Prisma.defineExtension({
     name: "hashPassword",
     query: {
          user: {
               async create({ args, query }) {
                    let passwordArg = args.data.password
                    if (passwordArg) {
                         const hashPassword = bcrypt.hash(passwordArg, 10)
                         passwordArg = await hashPassword
                    }

                    return query(args)
               },

               async update({ args, query }) {
                    let passwordArg = args.data.password
                    if (passwordArg) {
                         passwordArg = await bcrypt.hash(
                              passwordArg as string,
                              10
                         )
                    }

                    return query(args)
               },
          },
     },
})
