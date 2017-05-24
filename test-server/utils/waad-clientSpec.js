var
Q = require( 'q' ),
chai = require( 'chai' ),
auth = require( '../../server/utils/waad-auth' ),
querystring = require( 'querystring' ),
NodeCache = require( 'node-cache' ),
GraphClient = require( '../../server/utils/waad-client' );

var config = {
  tenant: 'Improving.onmicrosoft.com',
  clientid: '88ccf307-75bc-44cf-889c-95d1e857d061',
  clientsecret: 'x5FyUcoipkGwb7ok8tJeAcGcn5PBKbFla6hhuk/2UKU='
};

var testData = {
  objectId: 'a3fede0f-aa68-411d-9cc9-de696479c30a',
  upn: 'Tim.Rayburn@improvingenterprises.com',
  url: 'https://graph.windows.net/Improving.onmicrosoft.com/directoryObjects/62e90394-69f5-4237-9190-012177145e10/Microsoft.WindowsAzure.ActiveDirectory.Role'
}

chai.should();
chai.use( require( 'chai-things' ));

describe( 'waad-client cached', function () {

  var client = undefined;
  var promise = undefined;
  var cache = undefined;

  before(function ( done ) {
    cache = new NodeCache();
    auth.getGraphClient( config.tenant, config.clientid, config.clientsecret, cache )
    .then(function ( c ) {
      client = c;
    }).done( done );
  });

  describe( 'getUrl', function () {

    beforeEach(function () {
      cache.flushAll();
    });

    it( 'should return cached results', function () {
      var obj = {};
      var fullUrl = testData.url + '?' + querystring.stringify({ 'api-version': client.options.apiVersion });
      cache.set( fullUrl, obj );

      return client.getUrl( testData.url ).then(function ( data ) {
        data.should.be.equal( obj );
      });
    });

    it( 'should cache results', function () {
      return client.getUrl( testData.url ).then(function ( data ) {
        cache.getStats().keys.should.equal( 1 );
      });
    });

    it( 'should use querystring in cache', function () {
      var partialUrl = 'http://junk.com/foo';
      var qs = { abc: 123, 'api-version': client.options.apiVersion };
      var url = partialUrl + '?' + querystring.stringify( qs );
      var obj = {};

      cache.set( url, obj );
      return client.getUrl( partialUrl, qs ).then(function ( data ) {
        cache.getStats().hits.should.equal( 1 );
        cache.get( url )[ url ].should.equal( obj );
        data.should.equal( obj );
      });
    });

  });

});

describe( 'waad-client non-cached', function () {

  var client = undefined;
  var promise = undefined;

  before(function ( done ) {
    auth.getGraphClient( config.tenant, config.clientid, config.clientsecret )
    .then(function ( c ) {
      client = c;
    }).done( done );
  });

  describe( 'getUrl', function () {

    before(function () {
      promise = client.getUrl( testData.url );
    });

    it( 'should log so I can get feedback', function () {
      return promise.then(function ( data ) {
        console.log( data );
      });
    });

    it( 'should return a promise', function () {
      return promise.should.eventually.be.fufilled;
    });

  });


  describe( 'getUser', function () {

    describe( 'by ObjectId', function () {

      before(function () {
        promise = client.getUser( testData.objectId );
      });

      it( 'should return an mailNickname', function () {
        return promise.should.eventually.have.property( "mailNickname" );
      })

    });

  });

  describe( 'getManager', function () {

    describe( 'by ObjectId', function () {

      before(function () {
        promise = client.getManager( testData.objectId );
      });

      it( 'should return an array of Manager urls', function () {
        return promise.then(function ( manager ) {
          manager.should.have.property( "url" );
          return manager;
        });
      });

    });

    describe( 'by Upn', function () {

      before(function () {
        promise = client.getManager( testData.upn );
      });

      it( 'should return an array of Manager urls', function () {
        return promise.then(function ( manager ) {
          manager.should.have.property( "url" );
          return manager;
        });
      });

    });


  });


  describe( 'getUsers', function () {

    before(function () {
      promise = client.getUsers({ top: 5 });
    });

    it( 'should return a promise', function () {
      return promise.should.eventually.be.fufilled;
    });

    it( 'should return an array of users', function () {
      return promise.should.eventually.be.an( 'array' );
    });

    it( 'should honor top and return only requested number', function () {
      return promise.should.eventually.have.deep.lengthOf( 5 );
    });

  });


  describe( 'getGroups', function () {

    describe( 'given objectId', function () {

      before(function () {
        promise = client.getGroups( testData.objectId );
      });

      it( 'given objectId should return an array of Group urls', function ( done ) {
        promise.then(function ( groups ) {
          groups.should.all.have.property( "url" );
          done();
        }, function ( err ) {
          done( err );
        });
      });

    });

    describe( 'given upn', function () {

      before(function () {
        promise = client.getGroups( testData.upn );
      });

      it( 'given upn should return an array of Group urls', function ( done ) {
        promise.then(function ( groups ) {
          groups.should.all.have.property( "url" );
          done();
        }, done );
      });

    });

  });

});
