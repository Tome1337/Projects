#!/usr/local/bin/node

const { spawn } = require('child_process');

function Spawn( service )
{
    if( Array.isArray( service ))
    {
        service.forEach( Spawn );
    }
    else
    {
        console.log( 'Service ' + service + ' started' );

        let pckg = require( __dirname + '/' + service + '/package.json' );

        const subprocess = spawn( 'node', [ __dirname + '/' + service + '/' + pckg.main ], { cwd: __dirname + '/' + service, stdio: 'ignore' });

        subprocess.on( 'close', ( code ) =>
        {
            console.log( 'Service ' + service + ' died - restarting' );

            Spawn( service );
        });
    }
}

Spawn([ 'broker', 'logger', 'filmview-site' ]);