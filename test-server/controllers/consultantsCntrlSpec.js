var
Q = require( 'q' ),
cntrl = require( '../../server/controllers/consultantsCntrl' ),
mongoose = require( 'mongoose' ),
Consultants = mongoose.model( 'Consultants' );

var
result = undefined,
dfd = undefined;

describe( 'consultantsCntrl', function () {

  beforeEach(function ( done ) {
    result = undefined;
    dfd = Q.defer();
    Consultants.remove({}, function ( err ) {
      if ( err ) return done( err );
      Consultants.create(
      { name: "tim", email: 't@ie.com', emailNickname: 't', adId: '1' },
      { name: "cori", email: 'c@ie.com', emailNickname: 'c', adId: '2' },
      function ( err, tim, cori ) {
        if ( err ) return done( err );
        done();
      });
    });
  });

  describe( 'getAll', function () {

    it( 'should retrieve all consulants', function ( done ) {
      var res = {
        send: function ( data ) {
          result = data;
          dfd.resolve();
        }
      }

      cntrl.getAll( null, res );

      dfd.promise.then(function () {
        expect( result.length ).to.equal( 2 );
        done();
      }).catch(function ( err ) {
        done( err );
      });
    });

  });
});
