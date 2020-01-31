module.exports = class Query
{
	static localize( entry, properties, locales )
	{
		for( let property of properties.filter( p => entry.hasOwnProperty( p ) ) )
		{
			if( entry[property] && typeof entry[property] === 'object' )
			{
				let default_locale = Object.keys(entry[property])[0];

				for( let locale of locales.filter( l => !entry[property].hasOwnProperty( l ) ) )
				{
					entry[property][locale] = entry[property][default_locale];
					if( properties.includes('translated') && !entry.hasOwnProperty('translated') )
					{
						entry['translated'] = {};
						entry['translated'][locale] = 0;
					}
				}
			}
			else
			{
				let value = entry[property]; entry[property] = {};

				for( let locale of locales )
				{
					entry[property][locale] = value;
					if( properties.includes('translated') && !entry.hasOwnProperty('translated') )
					{
						entry['translated'] = {};
						entry['translated'][locale] = 0;
					}
				}
			}
		}
	}

	static generate_localizations( entry, properties, locales, queries, table )
	{
		for( let property of properties.filter( p => entry.hasOwnProperty( p ) ) )
		{
			if( typeof entry[property] === 'object' )
			{
				for( let locale of locales.filter( l => entry[property].hasOwnProperty( l ) ) )
				{
					if( entry[property][locale] )
					{
						queries.get( '_' + locale + '_' + table )[property] = entry[property][locale];
					}
				}
			}
			else
			{
				for( let locale of locales )
				{
					if( entry[property] )
					{
						queries.get( '_' + locale + '_' + table )[property] = entry[property];
					}
				}
			}
		}
	}


	static generate_localization_texts = function ( entry, properties, locales, default_locale, table, id )
	{
		let localized_rows = [];

		for( let property of properties.filter( p => entry.hasOwnProperty( p ) ) )
		{
			if( typeof entry[property] === 'object' )
			{
				for( let locale of locales.filter( l => entry[property].hasOwnProperty( l ) ) )
				{
					localized_rows.push( { locale: locale, type: table, id, column: property, value: entry[property][locale] } );
				}
			}
			else
			{
				localized_rows.push( { locale: default_locale, type: table, id, column: property, value: entry[property] } );
			}
		}
		return localized_rows;
	}

	static generate_extensions = function ( entry, extensions, locales, default_locale, table, id )
	{
		let localized_rows = [];

		for( let [ extension, properties ] of Object.entries( extensions ) )
		{
			for( let property of properties.filter( p => entry[ extension ].hasOwnProperty( p ) ) )
			{
				if( typeof entry[extension][property] === 'object' )
				{
					for( let locale of locales.filter( l => entry[extension][property].hasOwnProperty( l ) ) )
					{
						localized_rows.push( { locale: locale, type: table + ':' + extension, id, column: property, value: entry[extension][property][locale] } );
					}
				}
				else
				{
					localized_rows.push( { locale: default_locale, type: table + ':' + extension, id, column: property, value: entry[extension][property] } );
				}
			}
		}
		return localized_rows;
	}

}
