// logger.js
import winston from 'winston';

import DailyRotateFile from "winston-daily-rotate-file";

// Buat transport untuk rotasi log berdasarkan ukuran file
const transport = new DailyRotateFile({
  filename: 'logs/access-control-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true, // Mengompres file log yang sudah usang
  maxSize: '20m', // Maksimal ukuran file log sebelum dirotasi (misalnya 20MB)
  maxFiles: '14d' // Simpan file log selama 14 hari
});

// Buat logger dengan transport rotasi
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    transport,
    new winston.transports.Console() // Tetap log ke console jika diperlukan
  ],
});

export default logger;
