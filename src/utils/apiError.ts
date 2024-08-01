interface ApiErrorProps {
     message: string
     statusCode: number
     errors: Error[]
     success: boolean
     stack?: string
     data: null
}

class ApiError extends Error implements ApiErrorProps {
     message: string
     statusCode: number
     data: null = null
     errors: Partial<Error>[] = []
     success: boolean = false
     stack?: string | undefined

     constructor(
          message: string = "Something went wrong",
          statusCode: number,
          errors: Partial<Error>[] = []
     ) {
          super(message)
          this.statusCode = statusCode
          this.message = message
          this.errors = errors

          if (Error.captureStackTrace) {
               Error.captureStackTrace(this, this.constructor)
          }

          this.stack = this.stack || new Error().stack
     }
}

export { ApiError }
