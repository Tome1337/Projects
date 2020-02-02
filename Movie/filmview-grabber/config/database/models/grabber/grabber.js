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

    async csfdList( page )
    {
        let list = new Map(), url = page === 1 ? 'https://www.csfd.cz/podrobne-vyhledavani/?type%5B0%5D=0&genre%5Btype%5D=2&genre%5Binclude%5D%5B0%5D=&genre%5Bexclude%5D%5B0%5D=&origin%5Btype%5D=2&origin%5Binclude%5D%5B0%5D=&origin%5Bexclude%5D%5B0%5D=&year_from=&year_to=&rating_from=&rating_to=&actor=&director=&composer=&screenwriter=&author=&cinematographer=&production=&edit=&sound=&scenography=&mask=&costumes=&tag=&ok=Hledat&_form_=film' : 'https://www.csfd.cz/podrobne-vyhledavani/strana-2/?type%5B0%5D=0&genre%5Btype%5D=2&genre%5Binclude%5D%5B0%5D=&genre%5Bexclude%5D%5B0%5D=&origin%5Btype%5D=2&origin%5Binclude%5D%5B0%5D=&origin%5Bexclude%5D%5B0%5D=&year_from=&year_to=&rating_from=&rating_to=&actor=&director=&composer=&screenwriter=&author=&cinematographer=&production=&edit=&sound=&scenography=&mask=&costumes=&tag=&ok=Hledat&_form_=film';

        let data = await Grabber.get( url,
            {
                headers:
                    {
                        'Accept-Language'   : 'cs-CZ',
                        'Referer'           : 'https://www.csfd.cz/'
                    }
            });

        let $ = cheerio.load(data);

        if( $('p.not-found').text() )
        {
            //terminate service
        }
        else
        {
            $('table.films a').map( async ( i, el ) => list.set( i, $( el ).attr('href') ) );

            setTimeout(async () =>
            {
                for (let [ key, url ] of list.entries() )
                {
                    setTimeout(async () => this.getMovie( url ), key * 5000 );

                    if( ( key + 1 ) === list.size )
                    {
                        setTimeout(async () => this.csfdList( page + 1 ), ( key + 1 ) * 5000 );
                    }
                }
            }, 5000 );
        }
    }

    async getMovie( url )
    {
        let movie =
        {
            uid: '',
            sk:
            {
                title       : '',
                description : '',
                interesings : []

            },
            cz:
            {
                title       : '',
                description : '',
                interesings : []
            },
            simillars   : [],
            videos      : [],
            gallery     : [],
            posters     : [],
            directors   : [],
            producers   : [],
            writers     : [],
            cameras     : [],
            musicans    : [],
            actors      : [],
            genres      : [],
            release     : '',
            runtime     : '',
            country     : '',
            language    : '',
            budget      : '',
            profit      : '',
            csfd:
            {
                rate    : '',
                reviews : []
            },
            imdb:
            {
                rate    : ''
            },
            metacritics:
            {
                rate    : ''
            }
        };

        let data = await Grabber.get('https://www.csfd.cz' + url + 'prehled/',
            {
                headers:
                    {
                        'Accept-Language'   : 'cs-CZ',
                        'Referer'           : 'https://www.csfd.cz/'
                    }
            });

        let $ = cheerio.load(data);

        movie.cz.title        = $('#main h1').text().trim();
        movie.cz.description  = $('#plots ul').children().last().text().trim();

        movie.genres        = $('#main .genre').text().trim().split('/');
        movie.directors     = $('#main span[itemprop="director"] a').map( ( i, el ) => $( el ).text().trim() ).get();
        movie.csfd.rate     = $('#sidebar h2.average').text().trim();

        process.exit();
    }

    async start()
    {
        return await this.csfdList( 1 );
    }
};
