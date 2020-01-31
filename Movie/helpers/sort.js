module.exports = class Sort
{
    static ObjectByArray( object, array, value )
    {
        return [...object].sort(( a, b ) =>
        {
            let i1, i2;
            for( let i = 0; i < array.length; i++ )
            {
                if( array[i] === a[value] ){ i1 = i }
                if( array[i] === b[value] ){ i2 = i }
                if( i1 && i2 ){ break }
            }
            return i1 - i2;
        } )
    }
}