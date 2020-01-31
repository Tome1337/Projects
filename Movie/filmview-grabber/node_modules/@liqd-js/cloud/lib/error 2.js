class CustomError extends Error
{
    constructor( clazz, ...params )
    {
        super( ...params );

        Error.captureStackTrace( this, clazz );
    }
}