'use strict';

module.exports = function ServiceCall( context, caller, id, method, ...params )
{
    const start = process.hrtime();

    return new Promise(( resolve, reject ) =>
    {
        const end = process.hrtime( start );

        console.log({ caller, service: id, method, params, took: (( end[0] * 1e9 + end[1] ) / 1e6 ).toFixed(3) + 'ms' });
    });
}