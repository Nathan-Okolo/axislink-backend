class AppError extends Error {
	constructor(message, statusCode = 500) {
		super(message);
		this.name = "SPOWSER_ERROR";
		this.statusCode = statusCode;
		this.isOperational = true;
		this.date = new Date();

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

export class BadRequestError extends AppError {
	constructor(message = "Bad Request", statusCode = 400) {
		super(message, statusCode);
	}
}

export class InternalServerError extends AppError {
	constructor(message = "Something wrong happened.", statusCode = 500) {
		super(message, statusCode);
	}
}

export class NotFoundError extends AppError {
	constructor(message = "Resource not found", statusCode = 404) {
		super(message, statusCode);
	}
}

export class DuplicateError extends AppError {
	constructor(message = "Duplicate value", statusCode = 406) {
		super(message, statusCode);
	}
}

export class ExpectationFailedError extends AppError {
	constructor(message = "Expected inputs were not supplied", statusCode = 417) {
		super(message, statusCode);
	}
}

export class UnAuthorizedError extends AppError {
	constructor(message = "Not Authorized access", statusCode = 401) {
		super(message, statusCode);
	}
}