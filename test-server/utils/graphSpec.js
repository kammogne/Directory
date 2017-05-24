var
Q = require( 'q' ),
chai = require( 'chai' ),
graph = require( '../../server/utils/graph' );

var config = {
  graph: {
    tenant: 'Improving.onmicrosoft.com',
    clientid: '88ccf307-75bc-44cf-889c-95d1e857d061',
    clientsecret: 'x5FyUcoipkGwb7ok8tJeAcGcn5PBKbFla6hhuk/2UKU='
  }
};

chai.should();

var promise = undefined;

describe( 'graph', function () {

  beforeEach(function () {
    graph.cache.flushAll();
  });

  it( 'should have a cache', function () {
    return graph.cache.should.be.an( 'object' );
  });

  it( 'should have a clientKey', function () {
    return graph.clientKey.should.be.a( 'string' );
  });

  describe( 'getClient', function () {

    it( 'should return cached value', function () {
      var obj = {};
      graph.cache.set( graph.clientKey, obj );

      promise = graph.getClient( config );

      return promise.should.eventually.equal( obj );
    });

    it( 'should return a new client if cache is empty', function () {
      promise = graph.getClient( config );

      return promise.should.eventually.be.an( 'object' );
    });

    it( 'should cache a new client if cache is empty', function () {
      promise = graph.getClient( config );

      return promise.then(function ( client ) {
        graph.cache.get( graph.clientKey )[ graph.clientKey ].should.equal( client );
      });
    });

  });

});