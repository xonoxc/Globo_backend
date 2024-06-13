import { Prisma } from "@prisma/client"

const excludeMechanism = (args: any) => {
     if (!args.select) {
          args.select = {}
     }
     args.select.password = false
     return args
}

export const excludePassword = Prisma.defineExtension({
     name: "excludePassword",
     query: {
          user: {
               async findUnique({ query, args }) {
                    args = excludeMechanism(args)
                    return query(args)
               },
               async findMany({ query, args }) {
                    args = excludeMechanism(args)
                    return query(args)
               },
               async findFirst({ query, args }) {
                    args = excludeMechanism(args)
                    return query(args)
               },
          },
     },
})
