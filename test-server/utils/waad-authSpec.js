var
Q = require( 'q' ),
chai = require( 'chai' ),
auth = require( '../../server/utils/waad-auth' ),
NodeCache = require( 'node-cache' ),
GraphClient = require( '../../server/utils/waad-client' );

var config = {
  tenant: 'Improving.onmicrosoft.com',
  clientid: '88ccf307-75bc-44cf-889c-95d1e857d061',
  clientsecret: 'x5FyUcoipkGwb7ok8tJeAcGcn5PBKbFla6hhuk/2UKU='
};

chai.should();

var promise = undefined;

describe( 'waad-auth', function () {

  describe( 'getGraphClient', function () {

    describe( 'given just credentials', function () {

      before(function () {
        promise = auth.getGraphClient( config.tenant, config.clientid, config.clientsecret );
      });

      it( 'should return a GraphClient', function () {
        return promise.should.eventually.be.an.instanceof( GraphClient );
      });

      it( 'should have an access token', function () {
        return promise.should.eventually.have.deep.property( 'options.accessToken' );
      });

      it( 'should not have a cache', function () {
        return promise.should.not.eventually.have.deep.property( 'options.cache' );
      });

      it( 'should have a rootUrl', function () {
        return promise.should.eventually.have.property( 'rootUrl', 'https://graph.windows.net/Improving.onmicrosoft.com' )
      });

    });

    describe( 'given credentials and cache', function () {

      before(function () {
        var cache = new NodeCache();
        promise = auth.getGraphClient( config.tenant, config.clientid, config.clientsecret, cache );
      });

      it( 'should return a GraphClient', function ( done ) {
        return promise.should.eventually.be.an.instanceof( GraphClient );
      });

      it( 'should have an access token', function () {
        return promise.should.eventually.have.deep.property( 'options.accessToken' );
      });

      it( 'should have a cache', function () {
        return promise.should.eventually.have.deep.property( 'options.cache' );
      });

      it( 'should have a cache of type NodeCache', function ( done ) {
        promise.then(function ( client ) {
          client.options.cache.should.be.an.instanceof( NodeCache );
          done();
        }, done );
      });

      it( 'should have a rootUrl', function () {
        return promise.should.eventually.have.property( 'rootUrl', 'https://graph.windows.net/Improving.onmicrosoft.com' )
      });

    });

  });

});