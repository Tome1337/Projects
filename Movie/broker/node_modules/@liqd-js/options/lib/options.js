'use strict';

const KEYWORDS = [ '_required', '_type', '_any', '_passes', '_convert', '_requires', '_expand', '_default' ];

function toArray( value )
{
	return Array.isArray( value ) ? value : [ value ];
}

function resolvePath( root, path )
{
	return ( path[0] === '.' ) ? (('.'+root).replace( new RegExp('(\.[^.]+){'+path.match(/^\.+/)[0].length+'}$'), '' ) + '.' + path.replace(/^\.+/,'')).replace(/^\./,'') : path;
}

function create( data, schema, options, requirements, parent = '' )
{
	for( let key in schema )
	{
		if( KEYWORDS.includes( key )){ continue; }

		let rule = schema[key], path = ( parent ? parent + '.' : '' ) + key,
			is_rule = Boolean( rule && typeof rule === 'object' ),
			is_expandable = is_rule && rule._expand === true && typeof data[key] === 'boolean';

		if( data.hasOwnProperty( key ) && !is_expandable )
		{
			let value = data[key];

			if( is_rule )
			{
				if( rule._type && !toArray( rule._type ).find( t => typeof value === t ))
				{
					throw new Error( 'Invalid options: "' + path + '" is of wrong type "' + ( typeof value ) + '", ' + toArray( rule._type ).map( t => '"'+t+'"' ).join(' or ') + ' is required' );
				}

				if( rule._any && !rule._any.find( v => value === v ))
				{
					throw new Error( 'Invalid options: "' + path + '" is of wrong value ' + JSON.stringify( value ) + ', ' + rule._any.map( v => JSON.stringify(v) ).join(' or ') + ' is required' );
				}

				if( rule._passes && !rule._passes( value ))
				{
					throw new Error( 'Invalid options: "' + path + '" is of wrong value ' + JSON.stringify( value ) + ', ( ' + rule._passes.toString() + ' ) is required' );
				}

				if( rule._convert )
				{
					value = rule._convert( value );
				}

				if( rule._requires )
				{
					requirements[path] = toArray( rule._requires ).map( r => resolvePath( path, r ));
				}

				if( Object.keys( rule ).filter( k => !KEYWORDS.includes( k )).length )
				{
					if( !value || typeof value !== 'object' )
					{
						throw new Error( 'Invalid options: "' + path + '" is of wrong type ' + JSON.stringify( value ) + ', "object" is required' );
					}
					else{ options[key] = create( value, rule, {}, requirements, path ); }
				}
				else{ options[key] = value; }
			}
			else{ options[key] = value; }
		}
		else if( data[key] !== false )
		{
			if( !is_rule )
			{
				options[key] = rule;
			}
			else
			{
				if( rule._required )
				{
					throw new Error( 'Invalid options: "' + path + '" is required' );
				}

				if( rule._requires )
				{
					requirements[path] = ( Array.isArray( rule._requires ) ? rule._requires : [ rule._requires ] ).map( r => resolvePath( path, r ));
				}

				if( rule.hasOwnProperty('_default') )
				{
					options[key] = rule._default;
				}
				else if( rule._expand )
				{
					options[key] = create( {}, rule, {}, requirements, path );
				}
			}
		}
	}

	return options;
}

// TODO array of option possibilities

module.exports = function( data, schema )
{
	try
	{
		let requirements = {}, options = create( data, schema, {}, requirements );

		for( let requirement in requirements )
		{
			for( let path of requirements[requirement] )
			{
				let node = options, keys = path.split(/\./), key;

				while(( key = keys.shift()) && node.hasOwnProperty(key)){ node = node[key]; }

				if( key )
				{
					throw new Error( 'Invalid options: "' + path + '" does not meet the requirements of "' + requirement + '"' );
				}
			}
		}

		return options;
	}
	catch(e){ throw new Error( e.message ); }
}
