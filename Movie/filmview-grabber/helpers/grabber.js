'use strict';

const cheerio = require('cheerio');
const querystring = require('querystring');
var iconv = require('iconv-lite');

function Request( method, url, data, options = {})
{
    return new Promise(( resolve, reject ) =>
    {
        let req = require( url.startsWith('https') ? 'https' : 'http' ).request( url, { method, ...options }, res =>
        {
            let body = [];

            //res.setEncoding('utf8');

            res.on( 'data', data => body.push( data ));
            res.on( 'end', () =>
            {
                body = Buffer.concat(body);

                resolve( res.headers['content-type'] && res.headers['content-type'].toLowerCase().includes('windows')
                    ? iconv.decode( body, 'win' + res.headers['content-type'].replace(/^.*windows-([0-9]+).*$/i,'$1') )
                    : body.toString('utf8')
                );
            });
            res.on( 'error', reject );

        });

        req.on( 'error', reject );

        data && req.write( data );
        req.end();
    });
}

module.exports = class Grabber
{
    constructor( options = {})
    {
        this.headers = options.headers || {};
        if( !this.headers['User-Agent'] )
        {
            this.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36';
        }
    }

    async request( method, url, data = {}, options = {})
    {
        if( typeof data === 'object' && data.headers ){ options = data; data = undefined }

        options.headers = { ...this.headers, ...( options.headers || {} )};

        if( data )
        {
            if( method === 'GET' )
            {
                url += ( !url.includes('?') ? '?' : '&' ) + querystring.stringify( data );
                data = undefined;
            }
            else if( method === 'POST' )
            {
                if( !options.headers ){ options.headers = {}}

                options.headers['Content-Type'] = 'application/json';
                data = JSON.stringify( data );
            }
        }

        let response = await Request( method, url, data, options );

        try{ return JSON.parse( response )}catch( e ){}
        if( response.trim().startsWith('<') )
        {
            try{ return cheerio.load( response )}catch( e ){ console.log( e )}
        }

        return response;
    }

    get( url, data, options = {})
    {
        return this.request( 'GET', url, data, options );
    }

    post( url, data, options = {})
    {
        return this.request( 'POST', url, data, options );
    }
};