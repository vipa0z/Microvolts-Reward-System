
const chalk = require("chalk");
const winston = require("winston");

// Create base Winston logger
const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(), // still keeps basic log
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "wheel.log" })
  ],
  silent: true,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ level, message }) => {
      return `[${level}] ${message}`;
    })
  )
})

// Wrap with colored console output for dev visibility
const logger = {
  info: (msg) => {
    console.log(chalk.blue("[INFO]"), msg);
    winstonLogger.info(msg);
  },
  success: (msg) => {
    console.log(chalk.green("[SUCCESS]"), msg);
    winstonLogger.info(msg);
  },
  warn: (msg) => {
    console.warn(chalk.yellow("[WARN]"), msg);
    winstonLogger.warn(msg);
  },
  error: (msg) => {
    console.error(chalk.red("[ERROR]"), msg);
    winstonLogger.error(msg);
  }
};

module.exports = logger;



module.exports = logger;