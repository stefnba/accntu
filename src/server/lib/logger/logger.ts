import fs from 'node:fs';
import path from 'node:path';
import { LOG_CONTEXT, LOG_LEVELS, LogLevel, LogMessage, LogOptions, LoggerOptions } from './types';

export class Logger {
    private minLevel: number;
    private logToFile: boolean;
    private logDir: string;
    private suppressConsole: boolean;

    constructor(options: LoggerOptions = {}) {
        this.minLevel = LOG_LEVELS[options.minLevel || 'INFO'];
        this.logToFile = options.logToFile || false;
        this.logDir = options.logDir || 'logs';
        this.suppressConsole = options.suppressConsole || false;

        if (this.logToFile) {
            // Ensure log directory exists
            if (!fs.existsSync(this.logDir)) {
                fs.mkdirSync(this.logDir, { recursive: true });
            }
        }
    }

    private shouldLog(level: LogLevel): boolean {
        return LOG_LEVELS[level] >= this.minLevel;
    }

    private getLogFilePath(level: LogLevel): string {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.logDir, `${date}-${level.toLowerCase()}.log`);
    }

    private async writeToFile(logMessage: LogMessage): Promise<void> {
        if (!this.logToFile) return;

        const filePath = this.getLogFilePath(logMessage.level);
        const jsonLog = JSON.stringify(logMessage) + '\n';

        try {
            await fs.promises.appendFile(filePath, jsonLog, 'utf8');
        } catch (error) {
            // If we can't write to file, fall back to console
            if (!this.suppressConsole) {
                console.error('Failed to write to log file:', error);
            }
        }
    }

    private formatConsoleMessage(msg: LogMessage): string {
        const base = `[${msg.timestamp}] ${msg.level}${msg.context ? ` [${msg.context}]` : ''}: ${msg.message}`;

        const details = [];
        if (msg.data) {
            details.push(`\nData: ${JSON.stringify(msg.data, null, 2)}`);
        }
        if (msg.error) {
            details.push(`\nError: ${msg.error.name}: ${msg.error.message}`);
            if (msg.error.stack) {
                details.push(`\nStack: ${msg.error.stack}`);
            }
            if (msg.error.cause) {
                details.push(`\nCause: ${JSON.stringify(msg.error.cause, null, 2)}`);
            }
        }

        return details.length ? `${base}${details.join('')}` : base;
    }

    private async log(message: string, options: LogOptions & { level: LogLevel }): Promise<void> {
        if (!this.shouldLog(options.level)) return;

        const logMessage: LogMessage = {
            timestamp: new Date().toISOString(),
            level: options.level,
            message,
            context: options.context,
            data: options.data,
            ...(options.error && {
                error: {
                    name: options.error.name,
                    message: options.error.message,
                    stack: options.error.stack,
                    cause: options.error.cause,
                },
            }),
        };

        // Write to file if enabled
        await this.writeToFile(logMessage);

        // Write to console if not suppressed
        if (!this.suppressConsole) {
            const formattedMessage = this.formatConsoleMessage(logMessage);
            switch (options.level) {
                case 'ERROR':
                    console.error(formattedMessage);
                    break;
                case 'WARN':
                    console.warn(formattedMessage);
                    break;
                case 'DEBUG':
                    console.debug(formattedMessage);
                    break;
                default:
                    console.log(formattedMessage);
            }
        }
    }

    debug(message: string, options: Omit<LogOptions, 'error'> = {}): void {
        void this.log(message, { ...options, level: 'DEBUG' });
    }

    info(message: string, options: Omit<LogOptions, 'error'> = {}): void {
        void this.log(message, { ...options, level: 'INFO' });
    }

    warn(message: string, options: LogOptions = {}): void {
        void this.log(message, { ...options, level: 'WARN' });
    }

    error(message: string, options: LogOptions = {}): void {
        void this.log(message, { ...options, level: 'ERROR' });
    }

    // HTTP request logging
    logRequest({
        method,
        url,
        status,
        duration,
    }: {
        method: string;
        url: string;
        status: number;
        duration: number;
    }): void {
        const level = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';
        void this.log(`${method} ${url} ${status} ${duration}ms`, {
            level,
            context: LOG_CONTEXT.REQUEST,
        });
    }
}
