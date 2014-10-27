'use strict';
module.exports = (function () {
    var fs = require ('fs'),
        path = require('path'),
         lib = {};
    lib.fs = fs;
    lib.path = path;
    var currentFileName = path.basename(__filename);

    function includeModules(modules) {
        var x;
        for (x in modules) {
            try {
                lib[x] = require(modules[x]);
            } catch (err) {
                console.log('Error with message: ' + err.message + ', Object: ' + x);
            } 
        }
    }

    function includeFromPath(path, filesToSkip) {
        loopThroughDirFiles(fs.readdirSync(path), path, filesToSkip);            
    }

    function loopThroughDirFiles(files, path, filesToSkip) {
        var f = files.length;
        var fileName;
        for (var i = 0; i < f; i++) {
            fileName = files[i];
            if (fileName != currentFileName && 
              (filesToSkip[fileName] == undefined ||
                filesToSkip[fileName].toLowerCase() != 'skip')) {
                getFileStatus(fileName, path, filesToSkip);
            }
        }
    }

    function getFileStatus(file, path, filesToSkip) {    
        var status = fs.lstatSync(path + lib.path.sep + file);
        var splitedFile;    
        if (status.isDirectory()) {
            includeFromPath(path + lib.path.sep + file, filesToSkip);
        } else {
            splitedFile = file.split('.');
            if (splitedFile[1].toLowerCase() == 'js') {                            
                lib[splitedFile[0]] = require(path + lib.path.sep + file); 
            }
        }
    }

    function getObjects(path, config) {
        if (lib.fs.existsSync(path)) {
            includeFromPath(path, config.filesToSkip);
        } else {
            console.log('Error: Directory "' + path + '" does not exist!');
            process.exit();
        }
        includeModules(config.modules);
        return lib;
    }

    return {
        getObjects: getObjects
    };    
})();
