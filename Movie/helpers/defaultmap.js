module.exports = class DefaultMap extends Map
{
    #default_getter;

    constructor( default_getter, ...args )
    {
        super( ...args );

        this.#default_getter = default_getter;
    }

    get( key, default_value = true )
    {
        let value = super.get( key );

        if( value === undefined && default_value ){ super.set( key, value = this.#default_getter() )}

        return value;
    }
};