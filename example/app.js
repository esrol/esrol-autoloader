'use strict';
var Autoloader = require ('../index.js');
var settings = {
  getNamespaces: true,
  getAsObject: true,
  path: __dirname + '/app',
  filesToSkip: ['controllers.skipMe', 'routes.skipMe']
};
var folders = new Autoloader(settings);
// console.log (folders) ->>
// { app: 
//    { controllers: { foo: [Function: Foo] },
//      routes: { baz: [Object], foo: [Function: Foo] } },
//   namespaces: [ 'controllers.foo', 'routes.baz.bar', 'routes.foo' ] }