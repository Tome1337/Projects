module.exports = class ObjectLib
{
	static isFunction ( obj ){ return Object.prototype.toString.call( obj ) === '[object Function]'; }
	static isPlainObject( obj ){ return Object.prototype.toString.call( obj ) === '[object Object]'; }
	static isArray( obj ){ return Object.prototype.toString.call( obj ) === '[object Array]'; }

	static clone()
	{
		var src, copyIsArray, copy, name, options, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
		if ( typeof target === "boolean" ) { deep = target; target = arguments[1] || {}; i = 2; }
		if( typeof target !== "object" && !this.isFunction(target) ){ target = {}; }
		if( length === i ){ target = this; --i; }

		for( ; i < length; i++ )
		{
			if( (options = arguments[ i ]) != null )
			{
				for( name in options )
				{
					src = target[ name ];
					copy = options[ name ];
					if( target === copy ) { continue; }
					if( deep && copy && ( this.isPlainObject(copy) || (copyIsArray = this.isArray(copy)) ) )
					{
						if( copyIsArray )
						{
							copyIsArray = false;
							clone = src && this.isArray(src) ? src : [];
						}
						else
						{
							clone = src && this.isPlainObject(src) ? src : {};
						}

						target[ name ] = this.clone( deep, clone, copy );
					}
					else if( copy !== undefined )
					{
						target[ name ] = copy;
					}
				}
			}
		}

		return target;
	}

	static mergeByKey(target_raw, key_raw, sources_raw, clone = true )
	{
		return ObjectLib.merge( target_raw, { [key_raw] : sources_raw }, clone );
	}

	static merge( target_raw, sources_raw, clone = true )
	{
		var target = ( clone ? this.clone( true, {}, target_raw ) : target_raw ),
			sources = ( clone ? this.clone( true, {}, sources_raw ) : sources_raw );

		var len = arguments.length;
		var idx = 0;

		while (++idx < len)
		{
			var source = arguments[idx];
			if( this.isPlainObject( source ) || this.isArray( source ) )
			{
				this.#deepMerge( target, source );
			}
		}

		return target;

	}
	static #deepMerge = ( target, value ) =>
	{
		for( var key in value )
		{
			if( key === '__proto__' || !value.hasOwnProperty( key ) ) { continue; }

			var oldVal = value[key];
   			var newVal = target[key];

			if( this.isPlainObject( newVal ) && this.isPlainObject( oldVal ) )
			{
				target[key] = this.#deepMerge(newVal, oldVal);
			}
			else if( this.isArray( newVal ) )
			{
				target[ key ] = oldVal; // ?? merge array oldVal, newVal ??
			}
			else
			{
				target[key] = oldVal;
			}
		}
		return target;
	}

	static debugObject( json )
	{
		if( typeof json != 'string' ){ json = JSON.stringify( json, undefined, 2 ); }

		json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) =>
		{
			let cls = 'number';

			if (/^"/.test(match))
			{
				if (/:$/.test(match)){ cls = 'key'; } else { cls = 'string'; }
			}
			else if (/true|false/.test(match))
			{
				cls = 'boolean';
			}
			else if (/null/.test(match))
			{
				cls = 'null';
			}
			return '<span class="' + cls + '">' + match + '</span>';
		});
	}

	static jsonParse( data )
	{
		return JSON.parse( data );
	}

	static WA( from, to, ratio )
	{
	    return Math.round( from + ( to - from ) * ratio );
	}
	static getColor( ratio )
	{
		if( ratio < 0.5 ){ ratio /= 0.5; return 'rgb('+this.WA( 211, 255, ratio )+','+this.WA( 47, 60, ratio )+','+this.WA( 47, 0, ratio )+')' }
		else{ ratio = ( ratio - 0.5 ) / 0.5; return 'rgb('+this.WA( 255, 56, ratio )+','+this.WA( 60, 142, ratio )+','+this.WA( 0, 60, ratio )+')' }
	}

	static clearParty( str )
	{
		return ( str != '' ? str.toLocaleLowerCase().replace(/ú/g,'u').replace(/í/g,'i').replace(/ľ/g,'l') : 'nezavisly' );
	}

	static getFullName( item )
	{
		return [ item.prefix, item.birthname, item.middlename, item.surname, item.suffix ].join(' ').trim().replace(/\s\s+/g,' ').replace(/\s+,/g,',')
	}
}
