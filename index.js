'use strict';

let fs = require ('fs');
let path = require ('path');

module.exports = class Autoloader {

  constructor(config) {
    if (!config) {
      throw new Error(`Modules autoloader expect object with settings as first 
        param`);
    }
    if (!config.path) {
      throw new Error(`"path" property is missing. Please provide the path to
        the desirable directory`);
    }
    return this._runProcedure(config);
  }

  _runProcedure(config) {
    this._onInitSetProperties(config);
    this._resolvePaths();
    this._includeFromPath(this._applicationPath);
    return {
      app: this._lib,
      namespaces: this._namespaces
    };           
  }
  
  _resolvePaths() {
    if (!fs.existsSync(this._applicationPath)) {
      let error = 'Directory "' + this._applicationPath + '" does not exist!';
      throw new Error(error);
    }      
  } 

  _onInitSetProperties(config) {
    this._config = config;
    this._config.filesToSkip ? true : this._config.filesToSkip = [];
    this._lib = {};
    this._namespaces = [];
    this._applicationPath = path.normalize(this._config.path);
    return config;
  }

  _includeFromPath(currentPath) {
    this._loopThroughDirsAndFiles(fs.readdirSync(currentPath), currentPath);
  }

  _loopThroughDirsAndFiles(dirs, currentPath) {
    let length = dirs.length;
    for (let i = 0; i < length; i++) {
      let file = path.normalize(currentPath + path.sep + dirs[i]);
      let namespace = this._getNamespaceWithDots(file);
      if (this._config.filesToSkip.indexOf(namespace) === -1) {
        this._getFileStatus(dirs[i], currentPath);
      }
    }        
  }

  _getFileStatus(fileName, currentPath) {
    let file = currentPath + path.sep + fileName;
    let status = fs.lstatSync(file);
    let namespaces = currentPath
    .replace(this._applicationPath, '')
    .split(path.sep);
    if (status.isDirectory()) {
      this._includeFromPath(file);
    } else {
      let splitedFileName = fileName.split('.');
      if (splitedFileName[1] && splitedFileName[1].toLowerCase() == 'js') {   
        this._processFile(
          this._lib, 
          namespaces, 
          currentPath, 
          fileName, 
          splitedFileName[0]
        );                  
      }
    }                  
  }

  _processFile(app, namespaces, currentPath, file, fileName) {
    let length = namespaces.length;
    for (let i = 0; i < length; i++) {
      if (namespaces[i] === '') {
        namespaces.splice(i, 1);
      }
    }    
    length = namespaces.length;
    for (let i = 0; i < length; i++) {
      let parentKey = namespaces[i];
      if (this._config.getAsObject && !app[parentKey]) {
        app[parentKey] = {};                                        
      }
      namespaces.splice(i, 1);
      if (namespaces.length) {
        // we need to move at least one level deeper to get the module
        return this._processFile(
          app[parentKey], 
          namespaces, 
          currentPath, 
          file, 
          fileName
        );           
      } else {
        return this._includeFile(app, parentKey, currentPath, file, fileName);               
      }
    }       
  }

  _includeFile(app, parentKey, currentPath, file, fileName) {
    currentPath = currentPath + path.sep + file;
    let namespace = this._getNamespaceWithDots(currentPath);
    let obj = require(currentPath);
    this._pushNamespace(namespace);             
    this._pushObjectsIntoApp(app, obj, parentKey, fileName); 
    return app;        
  } 

  _getNamespaceWithDots(currentPath) {
    // first replace the application path from the module path, 
    // then replace the OS path separators (/ or \) with .
    // finally, remove .js ext from the module path and 
    // return the namespace eg: core.routers.http
    return currentPath
    .replace(this._applicationPath, '')
    .split(path.sep)
    .join('.')
    .slice(1)
    .slice(0, -3);
  } 

  _pushNamespace(namespace) {
    if (this._config.getNamespaces) {
      this._namespaces.push(namespace);
    }
  }

  _pushObjectsIntoApp(app, obj, parentKey, fileName) {
    if (this._config.getAsObject) {
      app[parentKey][fileName] = {};
      app[parentKey][fileName] = obj;       
    }
  }


};
