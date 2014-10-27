# Modules-Autoloader
## How to install
npm install Modules-Autoloader 
or make a copy of autoload.js to your src folder
## How to use it
    var app = require('modules-autoloader');
    var config = {
        filesToSkip:{
            'some.js': 'skip',
            'another.js': 'skip'
        },
        modules:{
            '_': 'underscore'
        }
    }
    app = app.getObjects(__dirname + '/app',config);
    console.log(app);
As first param for `app.getObjects()` you should set the directory with js files, that you want to include `/someDir`. The second one is optional `config`. You can set which files to be skipped ( not included - if you have a property with the file name, but the value is not 'skip', the file will be included, so you can easily change the behavior with only one change ) and/or 
include other packages (node_modules folder) by setting the property and the name of the package `modules: { '_': 'underscore' }`

