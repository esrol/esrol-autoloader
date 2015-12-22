[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

# esrol-autoloader
An Autoloader Class for automatically including files.

## Installation

```sh
$ npm install --save esrol-autoloader
```
## Node Version Compatibility

| Node Version |
| ---- |
| >= 4.x |

## Usage

```js
'use strict';
let Autoloader = require ('esrol-autoloader');
let settings = {
  getNamespaces: true, //boolean - get path as namespace
  getAsObject: true, // boolean - get file as object
  path: __dirname + '/app', // path to file
  filesToSkip: ['controllers.skipMe', 'routes.skipMe'] // array - which files 
};
let folders = new Autoloader(settings);
console.log(folders);
// { app:
//    { controllers: { foo: [Function: Foo] },
//      routes: { baz: [Object], foo: [Function: Foo] } },
//   namespaces: [ 'controllers.foo', 'routes.baz.bar', 'routes.foo' ] }
```

<a name="Autoloader"></a>
## Autoloader
<a name="new_Autoloader_new"></a>
### new Autoloader()
An Autoloader Class for automatically including files.

## Tests

  To run the test suite, first install the dependencies, then run `npm test`:

```bash
$ npm install
$ npm test
```

## License

[MIT](https://github.com/esrol/esrol-autoloader/blob/master/LICENSE)



[npm-image]: https://badge.fury.io/js/esrol-autoloader.svg
[npm-url]: https://npmjs.org/package/esrol-autoloader
[travis-image]: https://travis-ci.org/esrol/esrol-autoloader.svg?branch=master
[travis-url]: https://travis-ci.org/esrol/esrol-autoloader
[coveralls-image]: https://coveralls.io/repos/esrol/esrol-autoloader/badge.svg
[coveralls-url]: https://coveralls.io/r/esrol/esrol-autoloader