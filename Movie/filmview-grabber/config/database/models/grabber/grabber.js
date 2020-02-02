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
        let list = new Map(), url = page === 1 ? 'https://www.csfd.cz/podrobne-vyhledavani/?type%5B0%5D=0&genre%5Btype%5D=2&genre%5Binclude%5D%5B0%5D=&genre%5Bexclude%5D%5B0%5D=&origin%5Btype%5D=2&origin%5Binclude%5D%5B0%5D=&origin%5Bexclude%5D%5B0%5D=&year_from=&year_to=&rating_from=&rating_to=&actor=&director=&composer=&screenwriter=&author=&cinematographer=&production=&edit=&sound=&scenography=&mask=&costumes=&tag=&ok=Hledat&_form_=film' : 'https://www.csfd.cz/podrobne-vyhledavani/strana-'+page+'/?type%5B0%5D=0&genre%5Btype%5D=2&genre%5Binclude%5D%5B0%5D=&genre%5Bexclude%5D%5B0%5D=&origin%5Btype%5D=2&origin%5Binclude%5D%5B0%5D=&origin%5Bexclude%5D%5B0%5D=&year_from=&year_to=&rating_from=&rating_to=&actor=&director=&composer=&screenwriter=&author=&cinematographer=&production=&edit=&sound=&scenography=&mask=&costumes=&tag=&ok=Hledat&_form_=film';

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
            //USERS
            directors   : [],
            producers   : [],
            writers     : [],
            scenarios   : [],
            cameras     : [],
            musicans    : [],
            actors      : [],
            scenogaphy  : [],
            costumes    : [],
            //ABOUT
            simillars   : [],
            videos      : [],
            gallery     : [],
            posters     : [],
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
                reviews : { total: 0, list: []  }
            },
            imdb:
            {
                rate    : '',
                reviews : { total: 0, list: [], url: '' }
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

        //LOCALIZED
        movie.cz.title        = $('#main h1').text().trim();
        movie.cz.description  = $('#plots ul').children().last().text().trim();

        movie.sk.title        = $('#main ul.names li img[title="Slovensko"]').next().text().trim();

        let nodeMap =
        {
            "Režie:"        : "directors",
            "Předloha:"     : "writers",
            "Scénář:"       : "scenarios",
            "Kamera:"       : "cameras",
            "Hudba:"        : "musicans",
            "Hrají:"        : "actors",
            "Producenti:"   : "producers",
            "Scénografie:"  : "scenogaphy",
            "Kostýmy:"      : "costumes",
        };

        $('#main div.creators div').map( (i,el) =>
        {
            let title = $( el ).find('h4').text().trim();

            if( nodeMap[ title ] )
            {
                movie[ nodeMap[ title ] ] = $( el ).find('span a').map( ( i, elm ) =>
                {
                    return {
                        uid  : $( elm ).attr('href').replace('tvurce', '').replace(/-.*/g, '').replace(/\//g, '').trim(),
                        name : $( elm ).text().trim()
                    }
                } ).get()
            }
        });

        //GLOBAL INFO
        movie.uid           = url.replace('film', '').replace(/-.*/g, '').replace(/\//g, '').trim();
        movie.genres        = $('#main .genre').text().split('/').map( value => value.trim() );
        movie.posters       = $('#main #posters table td div').map( ( i, el ) => 'https:' + $( el ).attr('style').match(/\((.*?)\)/)[1].replace(/\\/g, '').replace('?h180', '').replace(/['"]/g, '') ).get();
        movie.simillars     = $('#sidebar div.related ul li').map( ( i, el ) =>
        {
            return (
                {
                    uid  : $( el ).find('a').attr('href').match(/(\d+)/)[1],
                    name : $( el ).find('a').attr('href').text().trim()
                })
        } ).get();

        //RATE SITES
        movie.csfd.rate             = $('#sidebar h2.average').text().trim();
        movie.csfd.reviews.total    = $('#main div.content.comments').prev().text().trim().match(/\d+/)[0];
        movie.csfd.reviews.list     = $('#main div.content.comments ul li').map( ( i, el ) =>
        {
            return (
            {
                author          : $( el ).find('h5.author').text().trim(),
                rating          : $( el ).find('img.rating').attr('alt').trim().length,
                datePublished   : $( el ).find('p.post span.date.desc').text().replace(/[()]/g, '').trim(),
                reviewBody      : $( el ).find('p.post').text().trim().replace(/\([0-9].*[0-9]\)/g, '')
            })
        }).get();

        //TODO INTERESTINGS

        let imdb = $('img.imdb').parent().attr('href');

        if( imdb ) { console.log('idem na imbdb'); await this.fetchImdb( imdb.replace('combined', 'reference'), movie ) }

        console.log(movie)

        process.exit();
    }

    async fetchImdb( url, movie )
    {
        let data = await Grabber.get( url,
            {
                headers:
                    {
                        'Accept-Language'   : 'sk-SK',
                        'Referer'           : 'https://www.imdb.com/'
                    }
            });

        let $ = cheerio.load( data );

        movie.release  = parseInt($('#main span.titlereference-title-year a').text().trim());
        movie.runtime  = parseInt($('section.titlereference-section-additional-details table tr').eq(1).find('li').text().trim());
        movie.country  = $('section.titlereference-section-additional-details table tr').eq(3).find('li').text().trim();
        movie.language = $('section.titlereference-section-additional-details table tr').eq(4).find('li').text().trim();
        movie.budget   = $('section.titlereference-section-box-office table tr').eq(0).find('td').eq(1).text().trim().substring(1).replace(/,/g, '.');
        movie.profit   = $('section.titlereference-section-box-office table tr').eq(2).find('td').eq(1).text().trim().substring(1).replace(/,/g, '.');

        movie.imdb.rate   = parseFloat( $('#main span.ipl-rating-star__rating').text().trim().replace(/,/g, '.') );

        data = await Grabber.get( url.replace('reference', 'reviews'),
            {
                headers:
                    {
                        'Accept-Language'   : 'sk-SK',
                        'Referer'           : 'https://www.imdb.com/'
                    }
            });

        $ = cheerio.load( data );

        movie.imdb.reviews.total = parseFloat($('#main div.header span').text().trim().replace(/\s/, '.'));
        movie.imdb.reviews.url = url.replace('reference', 'reviews');
        movie.imdb.reviews.list = $('#main div.lister-list div').map( ( i, el ) =>
        {
            return (
                {
                    author          : $( el ).find('span.display-name-link a').text().trim(),
                    rating          : $( el ).find('div.ipl-ratings-bar span.rating-other-user-rating span').eq(0).text().trim(),
                    datePublished   : $( el ).find('div.display-name-date span.review-date').text().trim(),
                    reviewBody      : $( el ).find('div.content div.text.show-more__control').text().trim()
                })
        }).get().filter( f => f.author && f.rating && f.datePublished && f.reviewBody );

        data = await Grabber.get( url.replace('reference', 'videogallery/'),
            {
                headers:
                    {
                        'Accept-Language'   : 'sk-SK',
                        'Referer'           : 'https://www.imdb.com/'
                    }
            });

        $ = cheerio.load( data );

        movie.videos = $('#video_gallery_content ol li').map( ( i, el ) =>
        {
            return (
                {
                    image: $(el).find('img').attr('src').trim(),
                    url  : 'https://www.imdb.com' + $(el).find('a').attr('href').trim()
                })
        }).get();

        data = await Grabber.get( url.replace('reference', 'mediaindex'),
            {
                headers:
                    {
                        'Accept-Language'   : 'sk-SK',
                        'Referer'           : 'https://www.imdb.com/'
                    }
            });

        $ = cheerio.load( data );

        movie.gallery = $('#media_index_content #media_index_thumbnail_grid a').map( ( i, el ) => $(el).find('img').attr('src').trim().replace(/V1.*.jpg/g, 'V1.jpg') ).get();
    }

    async start()
    {
        //return await this.fetchImdb( 'https://www.imdb.com/title/tt0109830/reference' );
        return await this.csfdList( Math.floor(Math.random() * 20) + 1 );
    }
};
