'use strict';

/* istanbul ignore next */
if( !Array.prototype.values )
{
	Object.defineProperty( Array.prototype, 'values',
	{
		value: Array.prototype[Symbol.iterator],
		configurable: false,
		writable: false
	});
}

module.exports = class Heap
{
	constructor( comparator )
	{
		this.data = new Array();
		this.index = null;
		this.compare = comparator ? comparator : ( a, b ) => a < b ? -1 : 1;
	}

	static from( container, comparator )
	{
		let heap = new Heap( comparator );

		for( const item of container.values() )
		{
			heap.push( item );
		}

		return heap;
	}

	_sift_up( i )
	{
		let pi = ( i - 1 ) >> 1;

		while( i > 0 && this.compare( this.data[i], this.data[pi] ) < 0 )
		{
			let v = this.data[i];
			this.data[i] = this.data[pi];
			this.data[pi] = v;

			if( this.index )
			{
				this.index.set( this.data[i], i );
				this.index.set( this.data[pi], pi );
			}

			i = pi;
			pi = ( i - 1 ) >> 1;
		}
	}

	_sift_down( i )
	{
		let ci = 2 * i + 1;

		while( ci < this.data.length )
		{
			ci = this.data.length > ci + 1 && this.compare( this.data[ci+1], this.data[ci] ) < 0 ? ci + 1 : ci;

			if( this.compare( this.data[ci], this.data[i] ) < 0 )
			{
				let v = this.data[i];
				this.data[i] = this.data[ci];
				this.data[ci] = v;

				if( this.index )
				{
					this.index.set( this.data[i], i );
					this.index.set( this.data[ci], ci );
				}

				i = ci;
				ci = 2 * i + 1;
			}
			else{ break; }
		}
	}

	_sift( i )
	{
		if( i !== 0 && this.compare( this.data[i], this.data[( i - 1 ) >> 1] ) < 0 )
		{
			this._sift_up( i );
		}
		else
		{
			this._sift_down( i );
		}
	}

	_reindex()
	{
		this.index = new Map();

		for( let i = 0; i < this.data.length; ++i )
		{
			this.index.set( this.data[i], i );
		}
	}

	_get_item_index( item )
	{
		if( this.data.length )
		{
			if( this.data[0] === item )
			{
				return 0;
			}
			else
			{
				if( !this.index ){ this._reindex(); }

				return this.index.get( item );
			}
		}

		return undefined;
	}

	get size()
	{
		return this.data.length;
	}

	top()
	{
		return this.data.length ? this.data[0] : undefined;
	}

	push( item )
	{
		this.data.push( item );

		if( this.index ){ this.index.set( item, this.data.length - 1 ); }

		this._sift_up( this.data.length - 1 );
	}

	pop()
	{
		if( this.data.length )
		{
			let last = this.data.pop();

			if( this.data.length )
			{
				let top = this.data[0]; this.data[0] = last;

				if( this.index )
				{
					this.index.delete( top );
					this.index.set( last, 0 );
				}

				this._sift_down( 0 );

				return top;
			}
			else
			{
				if( this.index ){ this.index.delete( last ); }

				return last;
			}
		}
		else{ return undefined; }
	}

	update( item )
	{
		let i = this._get_item_index( item );

		if( i !== undefined )
		{
			this._sift( i );

			return true;
		}
		else{ return false; }
	}

	delete( item )
	{
		let i = this._get_item_index( item );

		if( i !== undefined )
		{
			if( i === 0 )
			{
				this.pop();
			}
			else
			{
				let last = this.data.pop();

				this.index.delete( item );

				if( i < this.data.length )
				{
					this.data[i] = last;
					this.index.set( last, i );

					this._sift( i );
				}
			}

			return true;
		}
		else{ return false; }
	}

	sort()
	{
		let data = this.data; this.data = new Array();

		if( this.index ){ this.index = new Map(); }

		for( const item of data )
		{
			this.push( item );
		}
	}
}
