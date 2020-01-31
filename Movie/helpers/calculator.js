module.exports = class Calculator
{
    #scope;

    constructor( scope )
    {
        this.#scope = scope;
    }

    totalPrice( products, paymentType, shippingType, locale )
    {
        let result = ( this.#scope.payments.find( p => p.type === paymentType ).price[locale] +  this.#scope.shippings.find( p => p.type === shippingType ).price[locale] );

        for( let product of products )
        {
            result += product.price * product.quantity
        }

        return result;
    }

    summary( products )
    {
        return products.reduce( ( acc, curr ) => ( acc.hasOwnProperty('price') ? acc.price : acc ) + ( curr.price * curr.quantity ) );
    }
}