import ApiError from "../utils/ApiError.js";

const errorHandler = (error, req, res, next) => {
    let err = error;
    if (!(error instanceof ApiError)) {
        const statusCode = err.statusCode || 500;
        const message = err.message || "Something Went Wrong";
        err = new ApiError(statusCode, message, err?.error);
    }

    return res.status(err.statusCode).json({ 
        status: "error",
        message: err.message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

export { errorHandler };
