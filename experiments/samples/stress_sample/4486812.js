require('jasmine-matchers');
var github = require('../lib/github.js');
var http = require('http');
var server = require('../lib/server.js');

describe('depot server', function() {
  var githubData = {
    project: {
      '0.1.0-123': {},
      '0.1.0-r123': {},
      '0.1.1-r123': {},
      '0.1.1': {
        name: 'project',
        maintainers: [
          'Foo <foo@bar>'
        ]
      },
      '0.1.0': {}
    }
  };

  describe('#setup', function() {
    beforeEach(function() {
      // mocking our github api
      spyOn(github, 'init');
      spyOn(github, 'getWatchedRepos').andCallFake(function(callback) {
        callback(null, []);
      });
      spyOn(github, 'getInfo').andCallFake(function(repos, callback) {
        callback(null, githubData);
      });
    });

    it('should get the github info passed as 2nd parameter', function() {
      server.init({}, function(err, githubData, server) {
        expect(githubData.project).toBeTruthy();
      });
    });
    it('should return a HTTP server as 3rd parameter', function() {
      server.init({}, function(err, githubData, server) {
        expect(server).toBeInstanceOf(http.Server);
      });
    });
  });

  describe('#prepareVersionsForNpm', function() {
    it('should pass the name of the latest version in _id and name', function() {
      var ret = server.prepareVersionsForNpm(githubData);
      expect(ret['project']._id).toBe('project');
      expect(ret['project'].name).toBe('project');
    });
    it('should provide the version information of each project within "versions"', function() {
      var ret = server.prepareVersionsForNpm(githubData);
      expect(ret['project'].versions).toBe(githubData['project']);
    });
    it('should extract the latest version', function() {
      var ret = server.prepareVersionsForNpm(githubData);
      expect(ret['project']['dist-tags'].latest).toBe('0.1.1');
    });
    it('should extract maintainers', function() {
      var ret = server.prepareVersionsForNpm(githubData);
      expect(ret['project']['maintainers'][0].name).toBe('Foo');
      expect(ret['project']['maintainers'][0].email).toBe('foo@bar');
    });
  });

  describe('#getInfoLatestVersion', function() {
    var preparedData = server.prepareVersionsForNpm(githubData);
    var ret = server.getInfoLatestVersion(preparedData.project);
    expect(ret).toBe(githubData.project['0.1.1']);
  });
  
  describe('#_handleRequest', function() {
    var proxyRequest;
    beforeEach(function() {
      proxyRequest = jasmine.createSpy('proxyRequest')
      server._versionData = server.prepareVersionsForNpm(githubData);
      latestVersionData = JSON.stringify(
        server._versionData['project']['versions']['0.1.1']
      );
      spyOn(server, '_handle200');
      spyOn(server, '_handle404');
    });
    afterEach(function() {
      server._versionData = null;
      latestVersionData = null;
    });
    it('should proxy requests to "registry.npmjs.org" for unknown packages', function() {
      var req = {
        url: '/unknown-package',
        headers: {}
      };
      server._handleRequest(req, null, {
        proxyRequest: proxyRequest
      });
      expect(proxyRequest).toHaveBeenCalled();
      expect(proxyRequest.mostRecentCall.args[2].host).toBe('registry.npmjs.org');
    });
    it('should send all information about /project on its own', function() {
      var req = {
        url: '/project',
        method: 'GET'
      };
      server._handleRequest(req, null, {});
      expect(server._handle200).toHaveBeenCalled();
      expect(server._handle200.mostRecentCall.args[1]).toBe(
        JSON.stringify(server._versionData['project'])
      );
    });
    it('should send version information about /project/0.1.1 on its own', function() {
      var req = {
        url: '/project/0.1.1',
        method: 'GET'
      };
      server._handleRequest(req, null, {});
      expect(server._handle200).toHaveBeenCalled();
      expect(server._handle200.mostRecentCall.args[1]).toBe(latestVersionData);
    });
    it('should return the latest version for /project/latest', function() {
      var req = {
        url: '/project/latest',
        method: 'GET'
      };
      server._handleRequest(req, null, {});
      expect(server._handle200).toHaveBeenCalled();
      expect(server._handle200.mostRecentCall.args[1]).toBe(latestVersionData);
    });
    it('should return 404 if version does not exists', function() {
      var req = {
        url: '/project/non-existing-version',
        method: 'GET'
      };
      server._handleRequest(req, null, {});
      expect(server._handle404).toHaveBeenCalled();
    });
  });
});
