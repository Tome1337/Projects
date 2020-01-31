'use strict';

const { LEVELS, LABELS } = require('./constants.js');

const STACK_RE = new RegExp('^([^\\(\\)]+|.*\\(' + __filename.split('').map( c => /^[A-Za-z0-9]+$/.test(c) ? c : ( c === "\\000" ? "\\000" : "\\" + c )).join('') + '(:[0-9]+){1,2}\\)\\s*)$', 'gm');
const STACK_FILE_RE = /(?<=\s*\().*?(?=(:[0-9]+){1,2}\))/;
const STACK_LINE_RE = /(?<=\s*\(.*?:)[0-9]+(?=(:[0-9]+){0,1}\))/;
const STACK_FUNC_RE = /(?<=\s*).*?(?=\s*\()/;
const VARIABLE_RE = /\$\{([0-9a-zA-Z_]+)\}/g;
const FORMAT = '${time} [${label}] ${message}';
const SERIALIZER = ( value ) => typeof value === 'object' ? JSON.stringify( value, null, '  ' ).replace(/^\{/,'\n{') : value;

const Stacks = new WeakMap();

module.exports = class Log
{
	constructor( level, fields, message )
	{
		if( fields ){ Object.assign( this, fields ); }

		this.timestamp = Date.now();
		this.level = level;
		this._message = message;

		let stack = {};
		Error.captureStackTrace( stack, Log );
		Stacks.set( this, stack );
	}

	toJSON()
	{
		let json = {};

		for( let key of Object.getOwnPropertyNames( this ))
		{
			if( key === '_message' ){ continue; }

			json[ key ] = this[ key ];
		}

		json.label = LABELS[this.level];
		json.message = this._message;

		return json;
	}

	toString()
	{
		return this.format();
	}

	format( format = FORMAT, serializer = SERIALIZER )
	{
		return format.replace( VARIABLE_RE, ( _, variable ) =>
        (
            variable === 'message'
            ? this.message.map( m => serializer( m, variable ) ).join(', ')
            : serializer( this[variable], variable )
        ));
	}

	get message()
	{
		for( let i = 0; i < this._message.length; ++i )
		{
			if( typeof this._message[i] === 'string' && VARIABLE_RE.test( this._message[i] ))
			{
				this._message[i] = this._message[i].replace( VARIABLE_RE, ( _, variable ) => SERIALIZER( this[variable], variable ));
			}
		}

		return this._message;
	}

	get label(){ return LABELS[this.level]; }
	get stack()
	{
		let stack = Stacks.get( this );

		if( typeof stack !== 'string' )
		{
			Stacks.set( this, stack = stack.stack.replace(STACK_RE,'').replace(/^\s*at\s*/gm, ''));
		}

		return stack;
	}
	get file(){ return ( this.stack.match(STACK_FILE_RE) || '' )[0]; }
	get line(){ return ( this.stack.match(STACK_LINE_RE) || '' )[0]; }
	get func(){ return ( this.stack.match(STACK_FUNC_RE) || '' )[0]; }
	get timeISO(){ return (new Date( this.timestamp )).toISOString(); }
	get timeUTC(){ return (new Date( this.timestamp )).toUTCString(); }
	get time()
	{
		let date = (new Date( this.timestamp )), offset = Math.abs(date.getTimezoneOffset());

		return	('0'+(date.getFullYear())).substr(-4) + '-' +
				('0'+(date.getMonth()+1)).substr(-2) + '-' +
				('0'+date.getDate()).substr(-2) + 'T' +
				('0'+date.getHours()).substr(-2) + ':' +
				('0'+date.getMinutes()).substr(-2) + ':' +
				('0'+date.getSeconds()).substr(-2) + '.' +
				('00'+this.timestamp).substr(-3) +
				(date.getTimezoneOffset() < 0 ? '-' : '+') +
				('0'+Math.floor(offset/60)).substr(-2) + ':' +
				('0'+(offset%60)).substr(-2);
	}
}
