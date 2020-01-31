# Options validation library

[![NPM version](https://img.shields.io/npm/v/liqd-options.svg)](https://www.npmjs.com/package/liqd-options)
[![Build Status](https://travis-ci.org/radixxko/liqd-options.svg?branch=master)](https://travis-ci.org/radixxko/liqd-options)
[![Coverage Status](https://coveralls.io/repos/github/radixxko/liqd-options/badge.svg?branch=master)](https://coveralls.io/github/radixxko/liqd-options?branch=master)
[![NPM downloads](https://img.shields.io/npm/dm/liqd-options.svg)](https://www.npmjs.com/package/liqd-options)
[![Known Vulnerabilities](https://snyk.io/test/github/radixxko/liqd-options/badge.svg?targetFile=package.json)](https://snyk.io/test/github/radixxko/liqd-options?targetFile=package.json)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Validate options like a PRO!

```js
const options =
{
	port: 80,
	frame:
	{
		compression:
		{
			treshold: 2048  
		}
	},
	client:
	{
		accept : () => true
	}
};

this._options = Options( options,
{
	server	: { _required: false, _passes: $ => $ instanceof Server },
	tls		: { _required: false, _type: 'object' },
	port	: { _required: true, _convert: parseInt },
	version : { _any: [ 8, 13 ] }
	frame	:
	{
		_expand	: true,

		mask	: { _type: 'boolean', _default: false },
		limit	: { _type: 'number', _default: 100 * 1024 * 1024, _convert: $ => Math.min( $, 100 * 1024 * 1024 )},
		compression	:
		{
			_default: false, _expand: true,

			treshold: { _type: 'number', _default: 1024 }
		}
	},
	client	:
	{
		_expand	: true,

		accept	: { _type: 'function' }
	}
});
```
