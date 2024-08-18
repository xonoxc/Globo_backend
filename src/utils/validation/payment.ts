import { z } from "zod"

const paymentSchema = z.object({
     amount: z.string().min(2, { message: "invalid amount value" }),
     currency: z.enum(["USD", "EUR", "GDB", "INR"], {
          errorMap: () => ({
               message: "currency must be either , 'USD', 'EUR', 'GDB', 'INR'",
          }),
     }),
     paymentMethod: z.enum(["credit_card", "paypal", "bank_transfer"], {
          errorMap: () => ({
               message: "payment method must be either: 'credi_card', 'paypal', 'bank_transfer' ",
          }),
     }),
     orderId: z.string({
          errorMap: () => ({
               message: "orderId is required!",
          }),
     }),
     cardNumber: z
          .string()
          .regex(/^\d{16}$/, "Invalid credit card number")
          .optional(),
})

export default paymentSchema