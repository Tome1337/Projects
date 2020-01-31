const Logger = require('liqd-logger');

global.LOGGER = function( service )
{
    const logger = new Logger();

    logger.attachLoggerStream( Logger.level.info, log =>
    {
        service.service('@com.webergency.logger').log( log.level, log.format() );
    });

    setTimeout(() => logger.notice( 'service started' ), 1000 );

    return logger;
}
global.Q = JSON.stringify;
global.NOOP = () => undefined;
global.SLEEP = ms => new Promise( r => setTimeout( r, ms ));
global.ERR = ( err ) =>
{
    if( err instanceof Error )
    {
        err = 
        {
            code    : 503, 
            message : err.message,
            data:
            {
                name    : err.name,
                file    : err.fileName,
                line    : err.lineNumber,
                column  : err.columnNumber,
                stack   : err.stack
            }
        }

        if( !err.data.filename && err.data.stack )
        {
            let info =  err.data.stack.split(/\s*\n\s*/)[1].match(/.*\((?<file>[^:]+):(?<line>[0-9]+):(?<column>[0-9]+)\)/) ||
                        err.data.stack.split(/\s*\n\s*/)[0].match(/(?<file>[^:]+):(?<line>[0-9]+):(?<column>[0-9]+)/);

            info && Object.assign( err.data, info.groups );
        }
    }

    else if( JSON.stringify( err ) === '{}' )
    {
        console.log(err)
        err =
        {
            code: 503,
            message : err.message || err.toString()
        };
    }
    
    return err;
}
