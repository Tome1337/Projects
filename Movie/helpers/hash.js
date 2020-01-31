function djb2_a( str, start, end, hash = 5381, step = 1 )
{
	let i = end + step;

	do
	{
		(( hash = hash * 33 + str.charCodeAt( i -= step )) > 272945431896312 ) && ( hash %= 4294967296 );
	}
	while( i > start );

	return hash;
}

module.exports = function Hash( str )
{
    if( str.length )
	{
		let prefix = djb2_a( str, 0, Math.min( 127, Math.floor(( str.length - 1 ) / 2 )), str.length );
		let suffix = djb2_a( str, Math.max( str.length - 128, Math.floor(( str.length - 1 ) / 2 ) + 1 ), str.length - 1 );

		if( str.length > 256 )
		{
			suffix += djb2_a( str, 128, str.length - 129, str.length, Math.floor( str.length / 128 ));
		}

        return (( BigInt( str.length % 16 ) << 60n ) + ( BigInt( prefix % 268435456 ) << 32n ) + BigInt( suffix % 4294967296 )).toString();
	}

	return 0;
}
