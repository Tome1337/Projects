# @liqd-js/options

[![NPM version](https://img.shields.io/npm/v/@liqd-js/options.svg)](https://img.shields.io/npm/v/@liqd-js/options.svg)
[![Build Status](https://api.travis-ci.org/liqd-js/options.svg?branch=master)](hhttps://api.travis-ci.org/liqd-js/options.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/liqd-js/options/badge.svg?branch=master)](https://coveralls.io/repos/github/liqd-js/options/badge.svg?branch=master)
[![NPM downloads](https://img.shields.io/npm/dm/@liqd-js/options.svg)](https://img.shields.io/npm/dm/@liqd-js/options.svg)
[![Known Vulnerabilities](https://snyk.io/test/github/liqd-js/options/badge.svg?targetFile=package.json)](https://snyk.io/test/github/liqd-js/options/badge.svg?targetFile=package.json)
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
