import { CookieOptions } from "express"

export const DB_NAME = "globodb"

export const BCRYPT_SALT_ROUNDS = 10
export const COOKIE_OPTIONS: CookieOptions = {
     httpOnly: true,
     secure: true,
     sameSite: "none",
     path: "/",
}

export const FREE_POST_LIMIT = 10
