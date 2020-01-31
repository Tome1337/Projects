'use strict';

const fs = require('fs');
const Server = require('liqd-server');
const Logger = require('liqd-logger');
const { Service } = require('@liqd-js/cloud');

Service.init([ 'ws://localhost:11547' ]);

const LoggerService = module.exports = class LoggerService extends Service
{
    static id = '@com.filmview.logger';

    #server; #clients = new Set();

    constructor()
    {
        super();

        this.#server = new Server();

        this.#server.get(( req, res ) => 
        {
            res.reply( fs.createReadStream( __dirname + '/html/logger.html' ), 'text/html' );
        });

        this.#server.ws(( client, req ) => 
        {
            this.#clients.add( client );
            
            client.on( 'close', () => this.#clients.delete( client ));
            client.on( 'error', () => undefined );
        });

        this.#server.listen( 10100 );
    }

    log( level, message )
    {
        console.log( level, message );

        for( let client of this.#clients )
        {
            client.send( JSON.stringify({ level: Logger.label[level], message }));
        }
    }
}

const logger = new LoggerService();