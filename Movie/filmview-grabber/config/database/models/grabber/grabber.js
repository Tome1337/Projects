const Model = require('../model');
const cheerio = require('cheerio');
const Grabber = new( require(__dirname + '/../../../../helpers/grabber'))(
    {
        headers:
            {
                'User-Agent'        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36',
                'Accept'            : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
    });


const Scrape = module.exports = class Scrape extends Model
{
    #DB;

    constructor( db, service )
    {
        super( service );

        this.#DB = db;
        this.service = service;
    }

    async csfd( id )
    {
        let data = await Grabber.get('https://www.csfd.cz/film/'+id+'/prehled/',
            {
                headers:
                    {
                        'Accept-Language'   : 'cs-CZ',
                        'Referer'           : 'https://www.csfd.cz/'
                    }
            });

        let $ = cheerio.load(data);

        if( $('a').attr('href') )
        {
            if( $('a').attr('href').endsWith('/prehled/') )
            {
                setTimeout(async () =>
                {
                    data = await Grabber.get($('a').attr('href'),
                        {
                            headers:
                                {
                                    'Accept-Language'   : 'cs-CZ',
                                    'Referer'           : 'https://www.csfd.cz/'
                                }
                        });

                    $ = cheerio.load(data);

                    console.log($.html())
                }, 5000);
            }
        }
        else
        {
            console.log('failed')
            //TU CAKAJ A SKUS ZNOVA TO ISTE ID
        }
    }

    async start()
    {
        await this.csfd( 626971 );
    }
};
