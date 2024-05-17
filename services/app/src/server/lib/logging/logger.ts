import winston from 'winston';

const { combine, timestamp, json } = winston.format;

const logger = winston.createLogger({
    levels: winston.config.syslog.levels,
    format: combine(timestamp(), json()),
    transports: [
        new winston.transports.Console({ level: 'error' }),
        new winston.transports.File({
            filename: 'logs/app.log'
        }),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: combine(
                timestamp(),
                json(),
                winston.format.errors({ stack: true })
            )
        })
    ]
});

export { logger };
