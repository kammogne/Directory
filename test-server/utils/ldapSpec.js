var
Q = require( 'q' ),
winston = require( 'winston' ),
chai = require( 'chai' ),
ldap = require( '../../server/utils/ldap' ),
ldapjs = require( 'ldapjs' );

var config = {
  url: 'ldap://cloud-dc1.cloudapp.net',
  user: 'cn=Dir Sync,CN=Managed Service Accounts,dc=improving,dc=local',
  password: '!mpr0v1ng!',
  dc: 'dc=improving,dc=local'
};

var testData = {
  upn: 'test@improving.local',
  dn: 'CN=test,OU=Disabled Accounts,OU=Improving Users,DC=improving,DC=local'
};

chai.should();

var promise = undefined;

describe( 'ldap', function () {

  describe( 'usingClient without setup', function () {

    it( 'should reject the promise', function () {
      promise = ldap.usingClient(function () {
        return "this should not be returned";
      });

      return promise.should.eventually.be.rejected;
    });

  });

  describe( 'usingClient', function () {

    beforeEach(function () {
      ldap.setup( config );
    });

    it( 'should return a promise', function () {
      promise = ldap.usingClient(function () {
        return {};
      });
      return promise.should.eventually.be.fulfilled;
    });

    it( 'should return parameter function result', function () {
      var obj = {};
      promise = ldap.usingClient( function () {
        return obj;
      });
      return promise.should.eventually.equal( obj );
    });

    describe( 'promise function', function () {

      it( 'function should be passed the client', function () {
        promise = ldap.usingClient( function ( client ) {
          client.should.not.be.null;
          client.bind.should.be.a('function');
          client.unbind.should.be.a('function');
        });
        return promise.should.eventually.be.fulfilled;
      });

      it( 'function should be passed the client with isBound', function () {
        promise = ldap.usingClient( function ( client ) {
          client.should.have.property('isBound', true);
        });
        return promise.should.eventually.be.fulfilled;
      });

    });

    describe( 'with client', function () {

      describe( 'searchByUpn', function () {

        it( 'should return an user with userPrincipalName', function () {
          promise = ldap.usingClient( function ( client ) {
            return client.searchByUpn( testData.upn );
          });
          return Q.all([
            promise.should.eventually.be.fulfilled,
            promise.should.eventually.have.property('userPrincipalName')
          ]);
        });

        it( 'should return null with a bad userPrincipalName', function () {
          promise = ldap.usingClient( function ( client ) {
            return client.searchByUpn( "XYZZY" );
          });
          return Q.all([
            promise.should.eventually.be.fulfilled,
            promise.should.eventually.be.null
          ]);
        });

      });

      describe( 'updateByUpn', function () {

        it( 'should pass object to function', function () {
          promise = ldap.usingClient( function ( client ) {
            return client.updateByUpn( testData.upn, function ( user ) {
              user.should.have.property('userPrincipalName');
              return user;
            });
          });

          return Q.all([
            promise.should.eventually.be.fulfilled,
            promise.should.eventually.have.property('userPrincipalName')
          ]);
        });

        it( 'should reject if user not returned', function () {
          promise = ldap.usingClient( function ( client ) {
            return client.updateByUpn( testData.upn, function ( user ) { });
          });

          return promise.should.eventually.be.rejected;
        });

        describe( 'with reset test data', function () {

          beforeEach(function () {
            return ldap.usingClient( function ( client ) {
              return client.searchByUpn( testData.upn ).then( function( user ) {
                var modifyDeferred = Q.defer();
                var changes = [];

                if ( user.hasOwnProperty('streetAddress') ) {
                  changes.push(new ldapjs.Change({
                    operation: 'delete',
                    modification: {
                      streetAddress: user.streetAddress
                    }
                  }));
                }

                if ( user.hasOwnProperty('homePhone') ) {
                  changes.push(new ldapjs.Change({
                    operation: 'delete',
                    modification: {
                      homePhone: user.homePhone
                    }
                  }));
                }

                changes.push(new ldapjs.Change({
                  operation: 'add',
                  modification: {
                    streetAddress: 'THIS IS A TEST'
                  }
                }));

                client.modify( testData.dn, changes, modifyDeferred.makeNodeResolver());
                return modifyDeferred.promise;
              });
            });
          });

          it( 'should delete value', function () {
            promise = ldap.usingClient(function ( client ) {
              return client.updateByUpn( testData.upn, function ( user ) {
                user.should.have.property('streetAddress');
                delete user.streetAddress;
                return user;
              }).catch(function (err) {
                winston.error(err.message);
              });
            });
            return Q.all([
              promise.should.eventually.be.fulfilled,
              promise.should.not.eventually.have.property('streetAddress')
            ]);
          });

          it( 'should change value', function () {
            promise = ldap.usingClient(function ( client ) {
              return client.updateByUpn( testData.upn, function ( user ) {
                user.should.have.property('streetAddress');
                user.streetAddress = '123 Main St.';
                return user;
              }).catch(function (err) {
                winston.error(err.message);
              });
            });
            return Q.all([
              promise.should.eventually.be.fulfilled,
              promise.should.eventually.have.property('streetAddress', '123 Main St.')
            ]);
          });

          it( 'should add value', function () {
            promise = ldap.usingClient(function ( client ) {
              return client.updateByUpn( testData.upn, function ( user ) {
                user.should.not.have.property('homePhone');
                user.homePhone = '555-555-5555';
                return user;
              }).catch(function (err) {
                winston.error(err.message);
              });
            });
            return Q.all([
              promise.should.eventually.be.fulfilled,
              promise.should.eventually.have.property('homePhone', '555-555-5555')
            ]);
          });

        });

      });

    });

  });

  describe( 'setup', function () {

    var testConfig = undefined;
    beforeEach(function () {
      testConfig = JSON.parse( JSON.stringify( config ));
    });

    it( 'requires url', function ( done ) {
      delete testConfig.url;
      try {
        ldap.setup( testConfig );
      } catch(e) {
        e.message.should.equal('url is required');
        done();
      }
    });

    it( 'requires user', function ( done ) {
      delete testConfig.user;
      try {
        ldap.setup( testConfig );
      } catch(e) {
        e.message.should.equal('user is required');
        done();
      }
    });

    it( 'requires password', function ( done ) {
      delete testConfig.password;
      try {
        ldap.setup( testConfig );
      } catch(e) {
        e.message.should.equal('password is required');
        done();
      }
    });

    it( 'requires dc', function ( done ) {
      delete testConfig.dc;
      try {
        ldap.setup( testConfig );
      } catch(e) {
        e.message.should.equal('dc is required');
        done();
      }
    });

    it( 'sets config', function ( done ) {
      ldap.setup( testConfig );
      ldap.config.should.equal( testConfig );
      done();
    });

  });

});
