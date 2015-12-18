'use strict';
let Autoloader = require ('esrol-autoloader');
let settings = {
  getNamespaces: true,
  getAsObject: true,
  path: __dirname + '/app',
  filesToSkip: ['controllers.skipMe', 'routes.skipMe']
};
let folders = new Autoloader(settings);
console.log(folders);
// { app:
//    { controllers: { foo: [Function: Foo] },
//      routes: { baz: [Object], foo: [Function: Foo] } },
//   namespaces: [ 'controllers.foo', 'routes.baz.bar', 'routes.foo' ] }