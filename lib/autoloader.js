/**
 * @author Ivaylo Ivanov
 * @public
 * @class Autoloader
 * @description An Autoloader Class for automatically including files.
 * @requires fs
 * @requires path
 * @requires debug
 */
'use strict';
const fs = require('fs');
const path = require('path');
const debug = require('debug')('esrol-autoloader');

module.exports = class Autoloader {

  /**
  * @private
  * @method constructor
  * @description Initialize _runProcedure method with config param.
  * @param {object} config - object with configuration data
  * @throws {error} error - if config object is missing, or there is no "path"
  * property in config object
  * @returns {object} - all files loaded into objects, and all their namespaces
  * as {array}
  */
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

  /**
  * @private
  * @method _runProcedure
  * @description Initialize a group of methods which will include files
  * specified from config.
  * @param {object} config - object with configuration data
  * @throws {error} error - from _resolvePaths method
  * @returns {object} - all files loaded into objects, and all their namespaces
  * as {array}
  * @see {@link _onInitSetProperties}
  * @see {@link _resolvePaths}
  * @see {@link _includeFromPath}
  */
  _runProcedure(config) {
    debug('Initializing autoloader');
    this._onInitSetProperties(config);
    this._resolvePaths();
    this._includeFromPath(this._applicationPath);
    debug('All files loaded successfully');
    return {
      app: this._lib,
      namespaces: this._namespaces
    };
  }

  /**
  * @private
  * @method _resolvePaths
  * @description Synchronously test whether or not the given dir path exists.
  * @throws {error} error - if path to file is incorrect
  */
  _resolvePaths() {
    if (!fs.existsSync(this._applicationPath)) {
      let error = 'Directory "' + this._applicationPath + '" does not exist!';
      throw new Error(error);
    }
  }

  /**
  * @private
  * @method _onInitSetProperties
  * @description Sets private properties with the configuration data that has
  * been provided and sets class' private properties.
  * @param {object} config - object with configuration data
  * @returns {object} config - object with configuration data
  */
  _onInitSetProperties(config) {
    this._config = config;
    this._config.filesToSkip = this._config.filesToSkip || [];
    this._lib = {};
    this._namespaces = [];
    this._applicationPath = path.normalize(this._config.path);
    return config;
  }

  /**
  * @private
  * @method _includeFromPath
  * @description Includes a file from the given path.
  * @param {string} currentPath - given path
  * @see {@link _loopThroughDirsAndFiles}
  */
  _includeFromPath(currentPath) {
    this._loopThroughDirsAndFiles(fs.readdirSync(currentPath), currentPath);
  }

  /**
  * @private
  * @method _loopThroughDirsAndFiles
  * @description Goes through provided list of files and dirs.
  * @param {array} dirs - all directories and files in currentPath
  * @param {string} currentPath - the current specified path for files
  * @see {@link _getNamespaceWithDots}
  * @see {@link _getFileStatus}
  */
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

  /**
  * @private
  * @method _getFileStatus
  * @description Check if the reached destination is a file or a directory.
  * If it's a directory - go deeper by invoking _includeFromPath on it.
  * @param {string} fileName - the name of the file or possibly a directory
  * @param {string} currentPath - the path to the destination
  * @see {@link _includeFromPath}
  * @see {@link _processFile}
  */
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
      let ext = splitedFileName.pop();
      if (ext === 'js') {
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

  /**
  * @private
  * @method _processFile
  * @description Goes through the tree of directories and adds them as
  * namespaces in the app object. When a file is found, _includeFile
  * gets called.
  * @param {object} app - app object
  * @param {array} namespaces - namespaces array (eg ['foo', 'bar'])
  * @param {string} currentPath - current path to file
  * @param {string} file - current file (eg: foo.js)
  * @param {string} fileName - current file name (eg: foo)
  * @see {@link _includeFile}
  * @see {@link _pushNamespace}
  */
  _processFile(app, namespaces, currentPath, file, fileName) {
    debug(`Method _processFile is working with: current namespaces: %s,
      current path: %s, current file: %s`, namespaces, currentPath, file);
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
    // if we're here, we're in the root directory
    currentPath = currentPath + path.sep + file;
    app[fileName] = require(currentPath);
    this._pushNamespace(fileName);
  }

  /**
  * @private
  * @method _includeFile
  * @description Include the file into the app object.
  * @param {object} app - app object
  * @param {string} parentKey - parent dir name (eg: controllers)
  * @param {string} currentPath - path to file
  * @param {string} file - file to be included (eg: foo.js)
  * @param {string} fileName - file name to be included (eg: foo)
  * @see {@link _pushNamespace}
  * @see {@link _pushObjectsIntoApp}
  */
  _includeFile(app, parentKey, currentPath, file, fileName) {
    debug('Including file %s now.', file);
    currentPath = currentPath + path.sep + file;
    let namespace = this._getNamespaceWithDots(currentPath);
    let obj = require(currentPath);
    this._pushNamespace(namespace);
    this._pushObjectsIntoApp(app, obj, parentKey, fileName);
    return app;
  }

  /**
  * @private
  * @method _getNamespaceWithDots
  * @description Creates a namespace from a file path. eg: app.foo.bar from
  * /app/foo/bar.js
  * @param {string} currentPath - path to file
  * @return {string} - replaced normal path with namespace path
  */
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

  /**
  * @private
  * @method _pushNamespace
  * @description Pushes namespaces into the namespaces array property.
  * @param {string} namespace - eg: app.foo.bar
  */
  _pushNamespace(namespace) {
    if (this._config.getNamespaces) {
      this._namespaces.push(namespace);
    }
  }

  /**
  * @private
  * @method _pushObjectsIntoApp
  * @description Inserts the loaded files as objects into the app object.
  * @param {object} app - the application process object
  * @param {object} obj - the object ot be pushed
  * @param {string} parentKey - parent dir name (eg: foo)
  * @param {string} fileName - the name of the file
  */
  _pushObjectsIntoApp(app, obj, parentKey, fileName) {
    if (this._config.getAsObject) {
      debug('Pushing object %s into app.', obj);
      app[parentKey][fileName] = {};
      app[parentKey][fileName] = obj;
    }
  }

};
