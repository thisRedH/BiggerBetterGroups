// Licensing information can be found at the end of this file.

const winston = require("winston");
require("winston-daily-rotate-file");

const fmt = winston.format.combine(
    //winston.format.colorize({ level: true }), // Dosn't seem to work. Breaks the console output?
    winston.format.timestamp({ format:"YY-MM-DD HH:mm:ss" }),
    winston.format.printf(info =>
        `[${info.timestamp}][${info.level.toUpperCase()}][${info.label}]: ${info.message}`
    ),
);

const fmtFile = winston.format.combine(
    winston.format.timestamp({ format:"YY-MM-DD HH:mm:ss" }),
    winston.format.printf(info =>
        `[${info.timestamp}][${info.level.toUpperCase()}]: ${info.message}`
    ),
);


const rotatingFileGL = new winston.transports.DailyRotateFile({
    level: "info",
    filename: "bot-%DATE%.log",
    dirname: "./logs",
    zippedArchive: true,
    maxSize: "2m",
    maxFiles: "16d",
    format: winston.format.combine(fmtFile),
});

const loggerGL = winston.createLogger({
    level: "debug",
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.label({ label: "global" }),
                fmt,
            ),
        }),
        rotatingFileGL,
    ],
});


const rotatingFileMsg = new winston.transports.DailyRotateFile({
    level: "info",
    filename: "msg-%DATE%.log",
    dirname: "./logs",
    zippedArchive: true,
    maxSize: "5m",
    maxFiles: "32d",
    format: winston.format.combine(fmtFile),
});

const loggerMsg = winston.createLogger({
    level: "info",
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.label({ label: "message" }),
                fmt,
            ),
        }),
        rotatingFileMsg,
    ],
});

global.logger = loggerGL;
module.exports = {
    Logger: winston.Logger,
    logger: loggerGL,
    loggerMsg,
};

/**
 * Copyright 2024 Matthias Roth
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
