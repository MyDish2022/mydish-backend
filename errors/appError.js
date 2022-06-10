const httpError = {
  OK: "OK",
  BAD_REQUEST: "BAD_REQUEST",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_SERVER: "INTERNAL_SERVER",
  ALREDY_EXIST: "ALREDY_EXIST",
  LIMIT_ESSAY: "LIMIT_ESSAY",
  UNAUTHORIZED: "UNAUTHORIZED",
  BAD_REQUEST: "BAD_REQUEST",
  UNIQUE_MEAL: "UNIQUE_MEAL",
  UNAVAILABLE_FOR_PASSING_ORDERS: "UNAVAILABLE_FOR_PASSING_ORDERS"
};
class appError extends Error {
  constructor(status, code, message) {
    super(message);
    this.code = code;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }

  toJson() {
    return {
      code: this.code,
      message: this.message,
    };
  }
}
class NotFoundError extends appError {
  constructor(message) {
    super(httpError.NOT_FOUND, 404, message || "Resource not found");
  }
}
class InternalError extends appError {
  constructor(message) {
    super(httpError.INTERNAL_SERVER, 500, message);
  }
}
class AlreadyExistError extends appError {
  constructor(message) {
    super(httpError.ALREDY_EXIST, 403, message || "Already Exist");
  }
}
class BadRequestError extends appError {
  constructor(message) {
    super(
      httpError.BAD_REQUEST,
      400,
      message || "Bad Request informations not provided"
    );
  }
}
class UniqueMealError extends appError {
  constructor(message) {
    super(
      httpError.UNIQUE_MEAL,
      400,
      message || "You already choose a meal from another restaurant"
    );
  }
}
class LimitEssay extends appError {
  constructor(message) {
    super(
      httpError.LIMIT_ESSAY,
      429,
      message || "vous avez dépasser le limit de reset password times"
    );
  }
}
class AuthorizationError extends appError {
  constructor(message) {
    super(
      httpError.UNAUTHORIZED,
      401,
      message || "Vous n'êtes pas autorisé à effectuer cette opération"
    );
  }
}
class unavailableForPassingOrdersError extends appError {
  constructor(message) {
    super(
      httpError.UNAVAILABLE_FOR_PASSING_ORDERS,
      503,
      message || "Restaurant unavailable for passing orders"
    );
  }
}
module.exports = {
  AuthorizationError,
  NotFoundError,
  AlreadyExistError,
  LimitEssay,
  UniqueMealError,
  InternalError,
  BadRequestError,
  unavailableForPassingOrdersError,
};
