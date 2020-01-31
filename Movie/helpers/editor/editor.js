const Template = require('liqd-template');
const template = new Template( { directories: [ __dirname + '/blocks' ] } );

module.exports = class Editor
{
    #blocks;

    constructor( blocks )
    {
        this.#blocks = blocks;
    }

    async render()
    {
        return ( await Promise.all( this.#blocks.map( block => template.render( block.type, { data: block.data } ) ) ) ).join('');
    }
};
