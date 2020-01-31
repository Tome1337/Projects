const Model = require('../model');
const cheerio = require('cheerio');
const Grabber = new( require(__dirname + '/../../../../helpers/grabber'))(
    {
        headers:
            {
                'User-Agent'        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36',
                'Accept'            : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language'   : 'sk-SK',
                'Referer'           : 'https://www.csfd.cz/'
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

    async fetchData( supplier, code )
    {
        let result = {};

        if( supplier === 'MF' )
        {
            let search = JSON.parse(( await Grabber.get("https://dynamic.sooqr.com/suggest/script/?type=suggest&searchQuery="+code+"&filterInitiated=false&triggerFilter=null&filtersShowAll=false&enableFiltersShowAll=false&securedFiltersHash=false&sortBy=0&offset=0&limit=24&requestIndex=0&locale=en_GB&url=%2F&index=custom%3A12868&view=40fd3f08b58e6ce7&account=SQ-112868-1&_="+Date.now())).replace('websight.sooqr.instances[\'SQ-112868-1\'].searchCallback.sendSearchQueryByScriptCompleted(','').replace(');', ''));

            let $ = cheerio.load(search.resultsPanel.html);

            result.originalURL = $('a').attr('href');

            if( result.originalURL )
            {
                $ = await Grabber.get( result.originalURL );

                result.original = $('#maincontent div.product.description').text().trim().replace(/[\t ][\t ]+/g,' ').replace(/\s*\n\s*/gm, '\n\n')/*.replace(/[\t ]*\n[\t ]*\s* /gm, '\n')*/;
                result.originalIMG = $('#maincontent div.thumbs_wrapper a.mt-thumb-switcher').attr('data-image');
                result.originalPARAM = $('#maincontent div.short_attributes table tr').map( ( i, el ) => ( { label: $( el ).find('.label').text(), value: $( el ).find('.data').text() } ) ).get();
            }

            result.lastFetch = Math.floor( Date.now() / 1000 );
        }
        return result;
    }

    async start()
    {
        console.log('som tu')
    }
};
