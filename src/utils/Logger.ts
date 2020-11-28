export class Logger{
    static logLevel : LogLevel

    static LogInformation(message: string){
        this.Log(message, LogLevel.INFO, 'white');
    }
    static LogTrace(message: string){
        this.Log(message, LogLevel.TRACE, 'grey');
    }
    static LogDebug(message: string){
        this.Log(message, LogLevel.DEBUG, 'chartreuse')
    }
    static LogWarning(message: string){
        this.Log(message, LogLevel.WARNING, 'yellow');
    }
    static LogError(message: string){
        this.Log(message, LogLevel.ERROR, 'red');
    }

    private static Log(message: string, logLevel: LogLevel, color: string){
        if(this.logLevel as number <= logLevel){
            console.log(`<span style='color:${color}'>${LogLevel[logLevel]}: ${message}</span>`);
        }
    }
}

export enum LogLevel{
    TRACE=0,
    DEBUG,
    INFO,
    WARNING,
    ERROR
}
