import { RedisClientOptions, createClient } from "redis"
import options from "./config"



class CacheService {
	private client: ReturnType<typeof createClient>

	constructor(clientOptions: RedisClientOptions) {
		this.client = createClient(clientOptions)
	}

	public async initConnection(): Promise<void> {
		try {
			await this.client.connect()

			this.initListenters()

			console.log("Redis client connected")

		} catch (error) {
			console.error(`Redis connection failed! ${error}`)
			throw new Error("Redis connection failure!")
		}
	}

	public initListenters(): void {
		this.client.on("ready", () => {
			console.log("Redis client is ready to use!")
		})

		this.client.on("error", (err) => {
			console.log(`Redis client Error : ${err}`)
		})

		this.client.on("end", () => console.log("redis client disconnected!"))
	}


	public async setValue(key: string, value: object): Promise<boolean> {
		try {
			const response = await this.client.set(key, JSON.stringify(value))

			if (response === "OK") return true
			return false

		} catch (error) {

			return false
		}

	}

	public async getValue(key: string): Promise<object | null> {
		try {
			const response = await this.client.get(key)
			if (response) {
				return JSON.parse(response)
			}
			return null

		} catch (error) {

			return null
		}

	}

	/*  if needed : In some special case */

	public async closeConnection(): Promise<void> {
		try {
			await this.client.quit()
		} catch (error) {
			throw error
		}
	}

}

export const cache = new CacheService(options)

