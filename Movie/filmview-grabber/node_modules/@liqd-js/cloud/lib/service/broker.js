'use strict';

const { Client } = require('@liqd-js/websocket');

const ServiceBroker = module.exports = class ServiceBroker
{
    #url; #callbacks; #client = null; #connect_timeout = 0;

    constructor( url, callbacks )
    {
        super();

        this.#url = url;
        this.#callbacks = callbacks;

        this._connect();
    }

    _handle_message( message )
    {
        if( message.method === 'service:discovery' )
        {
            #this.callbacks.discovery( ...message.params );
        }
        else if( message.method === 'service:call' )
        { 
            #this.callbacks.call( ...message.params );
        }
    }

    _connect()
    {
        if( !this.#client )
        {
            this.#client = new Client( this.#url, { headers: { 'x-connection-id': '123' }});

            this.#client.on( 'open', () =>
            {
                this.#connect_timeout = 0;

                this.#client.on( 'message', message => this._handle_message( JSON.parse( message )));
                this.#client.on( 'close', () => this._reconnect( client ));
            });

            this.#client.on( 'error', () => this._reconnect( client ));
        }
    }

    _reconnect( client )
    {
        if( client === this.#client )
        {
            this.#client.close();
            this.#client.removeAllListeners();
            this.#client = null;

            setTimeout( this._connect.bind( this ), this.#connect_timeout = Math.min( this.#connect_timeout * 2 + 50, 2000 ));
        }
    }
}