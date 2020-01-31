require('../helpers/bootstrap.js');

const Server = require('liqd-server');
const SQL = require('liqd-sql');
const fs = require('fs');
const Template = require('liqd-template');
const UIKit = require('liqd-ui-kit');

const { Service } = require('@liqd-js/cloud');

Service.init([ 'ws://localhost:11547' ]);

global.Q = JSON.stringify;
global.NOW_S = () => Math.floor( Date.now() / 1000 );

const Filmview = module.exports = class Filmview extends Service
{
    #config; #DB; #LOG;

    constructor()
    {
        super( '@com.filmview.site' );

        global.LOG = this.#LOG = LOGGER( this );

        const server = new Server(), template = new Template({ directories: [ __dirname + '/templates/app', UIKit.path() ]});

        const Data =
            {
                //TODO DOROBITR GETTER NA QL
                //get: async ( data ) => { return await this.service('@com.webergency.fitness/admin/trainer#1').get( data ) }
            };

        const scope =
        {
            ObjectLib : require( __dirname + '/../helpers/objectLib' ),
            Data
        };

        //ROUTES

        server.use( async( req, res, next ) =>
        {
            req.template = template;
            req.scope = scope;

            next();
        });

        server.get( '/data', async( req, res, next ) =>
        {
            try
            {
                res.setHeader( 'Cache-Control', 'public, max-age=31536000' );
                res.end( require('fs').readFileSync( __dirname + req.url ) );
            }
            catch(e){ res.reply(404); }
        });

        require( __dirname + '/routes/index')( server, this.service.bind( this ) );

        //END ROUTES

        LOG.info( 'server started' );

        server.listen( 10107 );
    }
};

const instance = new Filmview();