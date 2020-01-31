'use strict';

const { LEVELS, LABELS, COLORS } = require('./constants.js');
const Log = require('./log.js');
const LoggerStream = require('./logger_stream.js');

module.exports = class Logger
{
	constructor( options )
	{
		this.logger_streams_cnt = new Array( LABELS.length + 1 ).fill(0);
		this.logger_streams = this.logger_streams_cnt.map( v => [] );
	}

	static get level(){ return LEVELS; }
	static get label(){ return LABELS; }

	log( level, ...message )
	{
		if( this.logger_streams_cnt[level] )
		{
			let log, fields = ( typeof message[0] === 'object' ? message.shift() : undefined );

			for( let i = level; this.logger_streams_cnt[i]; ++i )
			{
				for( let logger_stream of this.logger_streams[i] )
				{
					if( !log ){ log = new Log( level, fields, message ); }

					logger_stream.log( log );
				}
			}
		}
	}

	emergency	( ...message ){ this.log( 0, ...message ); } // system is unusable
	alert		( ...message ){ this.log( 1, ...message ); } // action must be taken immediately
	critical	( ...message ){ this.log( 2, ...message ); } // critical conditions
	error		( ...message ){ this.log( 3, ...message ); } // error conditions
	warning		( ...message ){ this.log( 4, ...message ); } // warning conditions
	notice		( ...message ){ this.log( 5, ...message ); } // normal but significant condition
	info		( ...message ){ this.log( 6, ...message ); } // informational messages
	debug		( ...message ){ this.log( 7, ...message ); } // debug-level messages
	devel		( ...message ){ this.log( 8, ...message ); } // development messages

	flow(){} // autoEnd
	flowStart(){} // end az ked sa skonci
	flowEnd(){}

	scope(){} // autoEnd
	scopeStart(){} // end az ked sa skonci
	scopeEnd( id /* may be handle object */ ){}

	attachLoggerStream( level, stream, filter )
	{
		const logger_stream = new LoggerStream( this, stream );

		this.logger_streams[ level ].push( logger_stream );

		for( let i = 0; i <= level; ++i )
		{
			++this.logger_streams_cnt[i];
		}

		return logger_stream;
	}

	detachLoggerStream( instance )
	{

	}

	/*attachFlowLoggerStream()
	{

	}

	detachFlowLoggerStream()
	{

	}*/
}
