const request = require('../../helpers/request');

module.exports = ( server, service ) =>
{
    server.get('/:category(.*)-c:id(\\d+)', async (req, res) =>
    {
        LOG.notice( 'GET Filmview_Route/category::/' + req.query.category + '-c' + req.query.id );
        try
        {
            res.reply( await req.template.render('category', {}, req.scope ), 'text/html' );
        }
        catch( err )
        {
            console.log( err );
            LOG.error( 'GET Filmview_Route::/category', { ERROR: { ...err } } );
            res.reply( 500, 'Internal Server Error')
        }
    });

    server.get('/:actor(.*)-a:id(\\d+)', async (req, res) =>
    {
        LOG.notice( 'GET Filmview_Route/actor::/' + req.query.actor + '-a' + req.query.id );
        try
        {
            res.reply( await req.template.render('actor', {}, req.scope ), 'text/html' );
        }
        catch( err )
        {
            console.log( err );
            LOG.error( 'GET Filmview_Route::/actor', { ERROR: { ...err } } );
            res.reply( 500, 'Internal Server Error')
        }
    });

    server.get('/:movie(.*)-m:id(\\d+)', async (req, res) =>
    {
        LOG.notice( 'GET Filmview_Route/movie::/' + req.query.movie + '-m' + req.query.id );
        try
        {
            res.reply( await req.template.render('movie', {}, req.scope ), 'text/html' );
        }
        catch( err )
        {
            console.log( err );
            LOG.error( 'GET Filmview_Route::/movie', { ERROR: { ...err } } );
            res.reply( 500, 'Internal Server Error')
        }
    });

    server.get('/', async (req, res) =>
    {
        LOG.notice( 'GET Filmview_Route::index' );
        try
        {
            res.reply( await req.template.render('index', {}, req.scope ), 'text/html' );
        }
        catch( err )
        {
            console.log( err );
            LOG.error( 'GET Filmview_Route::index', { ERROR: { ...err } } );
            res.reply( 500, 'Internal Server Error')
        }
    });
};




