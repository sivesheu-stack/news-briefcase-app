// utils/logger.js
import winston from "winston";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const fmt = printf(({ level, message, timestamp, stack }) =>
    `${timestamp} [${level}]: ${stack || message}`
);

const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: combine(errors({ stack: true }), timestamp({ format: "HH:mm:ss" }), fmt),
    transports: [
        new winston.transports.Console({
            format: combine(colorize(), errors({ stack: true }), timestamp({ format: "HH:mm:ss" }), fmt),
        }),
    ],
});

export default logger;