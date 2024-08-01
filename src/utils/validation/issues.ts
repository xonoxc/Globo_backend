import { ZodIssue } from "zod"

const formatZodIssues = (
     issues: ZodIssue[]
): { path: string; message: string }[] => {
     return issues.map((issue) => {
          const path = issue.path.join(".")
          return { path, message: issue.message }
     })
}

export { formatZodIssues }
