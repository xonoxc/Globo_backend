import bcrypt from "bcryptjs"

const isPasswordCorrect = (
     userPass: string,
     payloadPass: string
): Promise<boolean> => {
     return bcrypt.compare(payloadPass, userPass)
}

export { isPasswordCorrect }
