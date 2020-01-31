'use strict';

const { LEVELS, LABELS, COLORS } = require('./constants.js');

module.exports = class LoggerStream
{
	constructor( logger, stream, filter )
	{
        if( typeof stream === 'function' )
        {
            this.log = stream;
        }
        else if( typeof stream === 'object' )
        {
            this.log = ( log ) =>
            {
                stream.stream.write('\x1b[38;5;'+COLORS[log.level]+'m' + log.format() + '\x1b[0m\n');
            }

            /*if( transport.write )
            {
                log.format()
            }
            else
            {*/

            //}
        }
        else{ throw new Error('Invalid LoggerStream transport'); }
	}

    detach()
    {

    }
}
