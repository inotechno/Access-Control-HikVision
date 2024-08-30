import log4js from 'log4js';

// Konfigurasi log4js
log4js.configure({
  appenders: {
    file: {
      type: 'dateFile',
      filename: 'logs/access-control.log',
      pattern: '.yyyy-MM-dd',
      compress: true,
      daysToKeep: 14,
      maxSize: '20MB'
    },
    console: {
      type: 'stdout'
    }
  },
  categories: {
    default: {
      appenders: ['file', 'console'],
      level: 'info'
    }
  }
});

const logger = log4js.getLogger();

export default logger;
