import { tokenPayload } from "./tokenPayload"

declare global {
     namespace Express {
          interface Request {
               user?: tokenPayload
          }
     }
}
