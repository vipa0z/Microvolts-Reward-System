const chalk = require("chalk");
const winston = require("winston");

const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message }) => {
          return `[${level}] ${message}`;
        })
      )
    }),
    new winston.transports.File({
      filename: "error.log",
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    new winston.transports.File({
      filename: "wheel.log",
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

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
