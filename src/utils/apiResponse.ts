interface ApiResponseProps {
	statusCode: number
	message: string
	success: boolean
	data: any
}


class ApiResponse implements ApiResponseProps {
	statusCode: number
	message: string
	success: boolean = true
	data: any = {}

	constructor(statusCode: number, message: string = "success", data: any) {
		this.data = data
		this.message = message


		if (statusCode > 400) {
			throw new Error("statusCode for apiResponses should be less than 400")
		}
		this.statusCode = statusCode
	}
}


export { ApiResponse }
