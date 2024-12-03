import { SERVER_ERROR } from "../utils/constant.util.js";

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || SERVER_ERROR;
    const message = err.message || 'Internal Server Error';
  
    console.error(`[${new Date().toISOString()}]`, err); // Log the error for debugging
  
    res.status(statusCode).json({
      success: false,
      message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Hide stack trace in production
    });
  };
  
  export default errorHandler;
  