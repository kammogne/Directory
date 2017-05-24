var
Q = require( 'q' ),
NodeCache = require( 'node-cache' ),
waad = require( './waad-auth' );

exports.cache = new NodeCache({ stdTTL: 600, checkperiod: 60 });

exports.clientKey = '__client__';

exports.getClient = function ( config ) {
  var self = this;
  var cachedValue;
  if ( !!( cachedValue = self.cache.get( self.clientKey )[ self.clientKey ])) {
    return Q( cachedValue );
  }

  return waad.getGraphClient(
    config.graph.tenant,
    config.graph.clientid,
    config.graph.clientsecret,
    self.cache ).then(function ( client ) {
    self.cache.set( self.clientKey, client );
    return client;
  });
};

exports.getManagerForUserByAdId = function ( config, adId ) {
  return this.getClient( config ).then(function ( client ) {
    return client.getManager( adId ).then(function ( manager ) {
      if ( manager.hasOwnProperty( 'url' ))
        return client.getUrl( manager.url ).catch(function () {
          return {};
        });
      else
        return {};
    });
  });
};

exports.getRolesForUserByAdId = function ( config, adId ) {
  return this.getClient( config ).then(function ( client ) {
    return client.getGroups( adId ).then(function ( groups ) {
      var promises = groups.map(function ( g ) {
        return client.getUrl( g.url );
      });

      return Q.allSettled( promises ).then(function ( fullGroups ) {
        return fullGroups.map(function ( g ) {
          return g.value;
        });
      });
    });
  });
};

exports.getUser = function ( config, adId ) {
  return this.getClient( config ).then(function ( client ) {
    return client.getUser( adId );
  });
};

exports.getUsers = function ( config ) {
  return this.getClient( config ).then(function ( client ) {
    return client.getUsers({ top: 999 });
  });
};
