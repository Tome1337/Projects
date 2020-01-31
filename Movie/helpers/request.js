const https = require('https');

module.exports = function( type, path, data = false )
{
    let hostname = 'ecommerce.webergency.com'

    if( data ){ data = JSON.stringify( data ) }

    if( path.includes('https') )
    {
        hostname = path.replace('https://', '').split('/')[0];

        path = path.replace('https://', '').split('/');

        path.shift(); path = '/' + path.join('/');
    }

    return new Promise((resolve, reject) =>
    {
        let options =
            {
                hostname    : hostname,
                port        : 443,
                path        : path,
                method      : type,
                headers:
                    {
                        'Content-Type' : 'application/json',
                        Authentication : 'webergency.com'
                    }
            };

        const req = https.request( options, ( res ) =>
        {
            let body = '';
            res.on( 'data', chunk => body += chunk );
            res.on('end', () =>
            {
                LOG.info( 'WE_Ecommerce_Routes_test::request', { code: res.statusCode, headers: res.headers, body } );
                resolve ( { code: res.statusCode, headers: res.headers, body } )
            } );
        });
        req.on( 'error', (error) => { reject( LOG.debug( error, { ERR: { code: 500, message: 'WE_Ecommerce_Routes_test::request', err: error } } ) ) } );

        if( data ) { req.write( data ) }
        req.end();
    });
};
