var
Q = require( 'q' ),
winston = require( 'winston' ),
ldap = require( 'ldapjs' );

exports.config = undefined;
exports.setup = function ( c ) {
  if(typeof c.url === 'undefined') throw new Error('url is required');
  if(typeof c.user === 'undefined') throw new Error('user is required');
  if(typeof c.password === 'undefined') throw new Error('password is required');
  if(typeof c.dc === 'undefined') throw new Error('dc is required');

  this.config = c;
};

exports.longLivedClient = undefined;

exports.usingClient = function ( withClient ) {
  var self = this;

  if ( typeof self.config === 'undefined' ) {
    var notConfiguredDeferred = Q.defer();
    notConfiguredDeferred.reject( "ldap is not setup" );
    return notConfiguredDeferred.promise;
  }


  var client = self.longLivedClient || ldap.createClient({
    url: self.config.url,
    maxConnections: 10,
    bindDN: self.config.user,
    bindCredentials: self.config.password
  });

  self.longLivedClient = client;

  client.searchByUpn = function ( upn ) {
    var searchDeferred = Q.defer();
    var opts = {
      filter: '(userPrincipalName=' + upn + ')',
      scope: 'sub'
    };

    this.search(self.config.dc, opts, function( err, res ) {
      if ( err ) {
        searchDeferred.reject( 'searchEntry: ' + err );
        return;
      }

      res.once('searchEntry', function( entry ) {
        winston.debug('searchEntry.searchEntry returned');
        searchDeferred.resolve( entry.object );
      });

      res.once('error', function( err ) {
        winston.error( 'searchEntry.error: ' + err.stack );
        searchDeferred.reject(err);
      });

      res.once('end', function( result ) {
        if ( searchDeferred.promise.isPending() ) {
          if ( result.status === 0 ) {
            searchDeferred.resolve( null );
          } else {
            searchDeferred.reject( result );
          }
        }
      });
    });

    return searchDeferred.promise;
  };

  client.updateByUpn = function ( upn, callback ) {
    var beforeMod;
    return this.searchByUpn( upn ).then(function ( user ) {
      beforeMod = JSON.parse( JSON.stringify( user ));
      var fromCallback = callback( user );

      if ( user !== fromCallback ) {
        throw new Error('function must return input parameter');
      }

      return fromCallback;
    }).then(function ( afterMod ) {
      var beforeKeys = Object.keys( beforeMod );
      var afterKeys = Object.keys( afterMod );
      var changes = [];
      var mods = {};

      beforeKeys.forEach(function ( key ) {
        if ( !afterMod.hasOwnProperty(key) ) {
          mods = {};
          mods[key] = beforeMod[key];
          winston.silly('DELETE ' + key + ' - ' + JSON.stringify(mods));
          changes.push(new ldap.Change({
            operation: 'delete',
            modification: mods
          }));
        }

        // now handle the inserts!!
        if (afterMod.hasOwnProperty(key) &&
          typeof afterMod[key] === 'string' &&
          beforeMod[key] != afterMod[key]) {
          mods = {};
          mods[key] = afterMod[key];
          winston.silly('REPLACE ' + key + ' - ' + JSON.stringify(mods));
          changes.push(new ldap.Change({
            operation: 'replace',
            modification: mods
          }));
        }
      });

      afterKeys.forEach(function ( key ) {
        if ( !beforeMod.hasOwnProperty(key) ) {
          mods = {};
          mods[key] = afterMod[key];
          winston.silly('ADD ' + key + ':' + afterMod[key] + ' - ' + JSON.stringify(mods));
          changes.push(new ldap.Change({
            operation: 'add',
            modification: mods
          }));
        }
      });

      if ( changes.length === 0 ) {
        return;
      }

      var dfd = Q.defer();
      client.modify( beforeMod.dn, changes, dfd.makeNodeResolver() );
      return dfd.promise.catch(function (err) { winston.error(err.message); });

    }).then(function () {
      return client.searchByUpn( upn );
    });
  };

  return Q.try(function () {
    client.isBound = true;
    return client;
  }).then( withClient ).then( function ( result ) {
    return result;
  });
};
