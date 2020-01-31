require('../helpers/bootstrap.js');

const SQL = require('liqd-sql');
const QL = require('liqd-ql');
const { Service } = require('@liqd-js/cloud');

const Model_Grabber = require( __dirname + '/config/database/models/grabber/grabber');

Service.init([ 'ws://localhost:11547' ]);

global.Q = JSON.stringify;
global.NOW_S = () => Math.floor( Date.now() / 1000 );
global.Clone = ( obj ) => JSON.parse( JSON.stringify( obj ));

const Grabber = module.exports = class Grabber extends Service
{
    #config; #DB; #QL; #LOG;

    constructor()
    {
        super( '@com.filmview.grabber' );
        global.LOG = this.#LOG = LOGGER( this );

        this.#config = Clone( require( __dirname + '/config/database/credentials.json' ));
        this.#config.mysql.database = 'filmview';
        //this.#DB = new SQL( this.#config );
        //this.#QL = new QL.Model( this.#DB, fs.readFileSync( __dirname + '/config/database/scheme/model.qlscheme', 'utf8' ));
        this.Grabber = new Model_Grabber( this.#DB, this.service.bind( this ) );
    }

    async start()
    {
        return await this.Grabber.start();
    }
};

const instance = new Grabber();

//GRABBER MODEL

instance.start().then( console.log ).catch( console.log );