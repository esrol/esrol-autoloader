'use strict';
let path = require('path');
let expect = require('chai').expect;
let Autoloader = require('../index.js');
let appDir = path.join(__dirname, '..');

function getObject(settings) {
  return new Autoloader(settings);
}

describe('Autoloader', () => {
  describe('Successful behavior', () => {
    var should = `Should return object with empty app object and empty array 
      of namespaces`;
    it(should, () => {
      let settings = {
        getNamespaces: true,
        getAsObject: true,
        path: path.join(appDir, 'example', 'empty'),
        filesToSkip: ['controllers.skipMe', 'routes.skipMe']        
      };
      let result = getObject(settings);
      expect(result).to.have.all.keys('app', 'namespaces');
      expect(result.app).to.be.empty;
      expect(result.namespaces).to.be.empty;
    });

    should = `Should return corect object for given directory`;
    it(should, () => {
      let settings = {
        getNamespaces: true,
        getAsObject: true,
        path: path.join(appDir, 'example', 'app'),
        filesToSkip: []        
      };
      let result = getObject(settings);
      expect(result).to.have.all.keys('app', 'namespaces');
      expect(result.app.routes).to.have.property('foo'); 
      expect(result.app.routes.foo).to.be.a('function'); 
      expect(result.app.controllers).to.have.property('foo'); 
      expect(result.app.controllers).to.not.have.property('bar'); 
      expect(result.app.controllers.foo).to.be.a('function'); 
    });

    should = `Should return correct app object and array of namespaces with
    length of 4`;
    it(should, () => {
      let settings = {
        getNamespaces: true,
        getAsObject: true,
        path: path.join(appDir, 'example', 'app'),
        filesToSkip: []        
      };
      let result = getObject(settings);
      expect(result).to.have.all.keys('app', 'namespaces'); 
      expect(result.namespaces).to.have.length(4);
    });

    should = `The same one, but with missing "filesToSkip" prop. in conf`;
    it(should, () => {
      let settings = {
        getNamespaces: true,
        getAsObject: true,
        path: path.join(appDir, 'example', 'app')      
      };
      let result = getObject(settings);
      expect(result).to.have.all.keys('app', 'namespaces'); 
      expect(result.namespaces).to.have.length(4);
    });    

    should = `Should return correct app object and array of namespaces with
    length of 3`;
    it(should, () => {
      let settings = {
        getNamespaces: true,
        getAsObject: true,
        path: path.join(appDir, 'example', 'app'),
        filesToSkip: ['routes.skipMe']        
      };
      let result = getObject(settings);
      expect(result).to.have.all.keys('app', 'namespaces'); 
      expect(result.namespaces).to.have.length(3);
    }); 

    should = `Should return only app object and empty array of namespaces`;
    it(should, () => {
      let settings = {
        getNamespaces: false,
        getAsObject: true,
        path: path.join(appDir, 'example', 'app'),
        filesToSkip: ['routes.skipMe']        
      };
      let result = getObject(settings);
      expect(result).to.have.all.keys('app', 'namespaces'); 
      expect(result.namespaces).to.have.length(0);
    });  

    should = `Should return empty app object and array of namespaces with 
      length of 3`;
    it(should, () => {
      let settings = {
        getNamespaces: true,
        getAsObject: false,
        path: path.join(appDir, 'example', 'app'),
        filesToSkip: ['routes.skipMe']        
      };
      let result = getObject(settings);
      expect(result).to.have.all.keys('app', 'namespaces'); 
      expect(result.app).to.be.empty;
      expect(result.namespaces).to.have.length(3);
    });

    should = `Should return object with empty app object and empty array 
      of namespaces`;
    it(should, () => {
      let settings = {
        getNamespaces: false,
        getAsObject: false,
        path: path.join(appDir, 'example', 'app'),
        filesToSkip: ['routes.skipMe']        
      };
      let result = getObject(settings);
      expect(result).to.have.all.keys('app', 'namespaces'); 
      expect(result.app).to.be.empty;
      expect(result.namespaces).to.be.empty;
    });   

    should = `The same one, but with missing "getNamespaces" and "getAsObject"
    prop. in config`;
    it(should, () => {
      let settings = {
        path: path.join(appDir, 'example', 'app'),
        filesToSkip: ['routes.skipMe']        
      };
      let result = getObject(settings);
      expect(result).to.have.all.keys('app', 'namespaces'); 
      expect(result.app).to.be.empty;
      expect(result.namespaces).to.be.empty;
    });  

  });

  describe('Throw an error', () => {
    var should = `Missing "path" prop. in config`;
    it(should, () => {
      let settings = {
        getNamespaces: true,
        getAsObject: true,
        filesToSkip: []        
      };
      expect(() => getObject(settings)).to.throw(Error);
    }); 

    should = `Bad absolute path for "path" prop. in config`;
    it(should, () => {
      let settings = {
        getNamespaces: true,
        getAsObject: true,
        path: path.join(appDir, 'fuckinFakeDir', 'app'),
        filesToSkip: []        
      };
      expect(() => getObject(settings)).to.throw(Error);
    }); 
  }); 
});