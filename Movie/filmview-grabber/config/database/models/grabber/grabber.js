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
            },
            cz:
            {
                title       : '',
                description : '',
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
            country     : [],
            language    : [],
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
                rate    : '',
                reviews : { total: 0, list: [], url: '' }
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
                    name : $( el ).find('a').text().trim()
                })
        } ).get();

        //RATE SITES
        movie.csfd.rate             = $('#sidebar h2.average').text().trim();
        movie.csfd.reviews.total    = $('#main div.content.comments').prev().find('h2 a').text().trim().replace( /\D+/g, '');
        movie.csfd.reviews.url      = 'https://www.csfd.cz' + url + 'komentare/'
        movie.csfd.reviews.list     = $('#main div.content.comments ul li').map( ( i, el ) =>
        {
            return (
            {
                author          : $( el ).find('h5.author').text().trim(),
                rating          : $( el ).find('img.rating').attr('alt') ? $( el ).find('img.rating').attr('alt').trim().length : 0,
                datePublished   : $( el ).find('p.post span.date.desc').text().replace(/[()]/g, '').trim(),
                reviewBody      : $( el ).find('p.post').text().trim().replace(/\([0-9].*[0-9]\)/g, '')
            })
        }).get();

        let imdb = $('img.imdb').parent().attr('href');
        if( imdb ) { await this.fetchImdb( imdb.replace('combined', 'reference'), movie ) }

        //TODO INTERESTINGS

        console.log(movie)
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

        //LOCALIZED
        movie.sk.title = $('#main h3').text().split(/\n/)[1].trim();

        $('section.titlereference-section-additional-details table tr').map( ( i, el ) =>
        {
            if( $(el).find('td').first().text().trim() === 'Runtime' )
            {
                movie.runtime = $(el).find('ul li').text().trim();
            }
            if( $(el).find('td').first().text().trim() === 'Country' )
            {
                movie.country = $(el).find('ul li a').map( ( i, el) => $(el).text().trim() ).get();
            }
            if( $(el).find('td').first().text().trim() === 'Language' )
            {
                movie.language = $(el).find('ul li a').map( ( i, el) => $(el).text().trim() ).get();
            }
        });

        $('section.titlereference-section-box-office table tr').map( ( i, el ) =>
        {
            if( $(el).find('td').first().text().trim() === 'Budget' )
            {
                movie.budget = $(el).find('td').eq(1).text().trim().substring(1).replace(/,/g, '.');
            }
            if( $(el).find('td').first().text().trim() === 'Cumulative Worldwide Gross' )
            {
                movie.profit = $(el).find('td').eq(1).text().trim().substring(1).replace(/,/g, '.');
            }
        });


        movie.release  = $('#main span.titlereference-title-year a').text().trim();
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

        movie.gallery = $('#media_index_content #media_index_thumbnail_grid a').map( ( i, el ) =>
        {
            if( $(el).find('img') && $(el).find('img').attr('src') )
            {
                return $(el).find('img').attr('src').trim().replace(/V1.*.jpg/g, 'V1.jpg')
            }
        } ).get().filter( f => f.length );

        data = await Grabber.get( url.replace('reference', ''),
            {
                headers:
                    {
                        'Accept-Language'   : 'sk-SK',
                        'Referer'           : 'https://www.imdb.com/'
                    }
            });

        $ = cheerio.load( data );

        if($('#main_top .titleReviewBarItem a'))
        {
            movie.metacritics.rate = $('#main_top .titleReviewBarItem .metacriticScore span').text().trim();
            data = await Grabber.get( url.replace('reference', $('#main_top .titleReviewBarItem a').attr('href')),
                {
                    headers:
                        {
                            'Accept-Language'   : 'sk-SK',
                            'Referer'           : 'https://www.imdb.com/'
                        }
                });

            $ = cheerio.load( data );

            movie.metacritics.reviews.list = $('#main table.crits_results tr').map( ( i, el ) =>
            {
                return (
                    {
                        author          : $( el ).find('span[itemprop="author"]').text().trim() || $( el ).find('span[itemprop="name"]').text().trim(),
                        rating          : $( el ).find('span[itemprop="ratingValue"]').text().trim(),
                        reviewBody      : $( el ).find('div[itemprop="reviewbody"]').text().trim()
                    })
            }).get().filter( f => f.author && f.rating && f.reviewBody );

            movie.metacritics.reviews.total = $('#main div.metascore_block span[itemprop="ratingCount"]').text().trim();
            movie.metacritics.reviews.url = $('#main div.see-more a').attr('href');
        }
    }

    async start()
    {
        //return await this.fetchImdb( 'https://www.imdb.com/title/tt0109830/reference', movie );
        return await this.csfdList( Math.floor(Math.random() * 20) + 1 );
        //return await this.getMovie( '/film/8587-byl-jednou-jeden-polda/' );
    }
};
