'use strict';

const crypto = require('crypto');

const ALGORITHMS = [ 'ES512', 'ES384', 'ES256', 'RS512', 'RS384', 'RS256', 'HS512', 'HS384', 'HS256' /*, 'PS256', 'PS384' */ ];

const toBase64URL = ( base64 ) => base64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
const fromBase64URL = ( base64url ) => base64url.replace(/\-/g,'+').replace(/_/g,'/');
const base64URLencode = ( data ) => toBase64URL( Buffer.from( data, 'utf8' ).toString('base64') );
const base64URLdecode = ( data ) => Buffer.from( fromBase64URL( data ), 'base64' ).toString('utf8');
const encode = ( data ) => base64URLencode( JSON.stringify( data ));
const decode = ( data ) => JSON.parse( base64URLdecode( data ));

class JSONWebToken
{
    constructor( header, payload, verified )
    {
		this._ok = verified;
		this._error = null;

        this.header = header;
		this.payload = payload;
    }

	get ok()
	{
		return this._ok;
	}
}

module.exports = class JWT
{
    constructor( algorithms )
    {
        this.algorithms = algorithms;
        this.algorithm = ALGORITHMS.find( a => algorithms[a] );

        /*for( let algorithm in algorithms )
        {
            if( algorithms[algorithm].key )
            {
                let key = crypto.createSecretKey( algorithm[algorithms].key );
            }
        }*/
    }

    create( payload, algorithm )
    {
        algorithm = algorithm || this.algorithm;

        let message = encode({ alg: algorithm, typ: 'JWT' }) + '.' + encode( payload ), bits = algorithm.substr(2);

        if( algorithm[0] === 'H' )
        {
            let hmac = crypto.createHmac( 'sha' + bits, this.algorithms[algorithm] );

            return message + '.' + toBase64URL( hmac.update( message ).digest('base64'));
        }
        else
        {
            let sign = crypto.createSign( 'SHA' + bits );

            return message + '.' + toBase64URL( sign.update( message ).sign( this.algorithms[algorithm], 'base64' ));
        }
    }

    parse( jwt )
    {
        let [ header, payload, signature ] = jwt.split('.');

        header = decode( header );
        payload = decode( payload );

        if( header.alg )
        {
            let bits = header.alg.substr(2);

            if( header.alg[0] === 'H' )
            {
                let hmac = crypto.createHmac( 'sha' + bits, this.algorithms[header.alg] );

                signature = ( toBase64URL( hmac.update( jwt.substr( 0, jwt.length - signature.length - 1 )).digest('base64')) === signature );
            }
            else
            {
                let verify = crypto.createVerify( 'SHA' + bits );

                signature = verify.update( jwt.substr( 0, jwt.length - signature.length - 1 )).verify( this.algorithms[header.alg].pub, signature, 'base64' );
            }
        }

        return new JSONWebToken( header, payload, signature === true );
    }
}
