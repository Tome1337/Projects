module.exports = global.Context = new Proxy({},
{
    get : function( obj, prop )
    {
        console.log( 'Getting Context value', prop );   
    },

    set : function( obj, prop, value )
    {
        console.log( 'Setting Context value', prop, value );
    }
});