var
Q = require( 'q' ),
request = require( 'request' ),
OAuthError = require( './waad-errors' ).OAuthError,
GraphClient = require( './waad-client' );

var authenticator = module.exports = {};

authenticator.getAccessTokenWithClientCredentials = function ( tenantDomain, clientId, clientSecret, apiVersion, callback ) {
  var data = {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  };

  request.post( 'https://login.windows.net/' + tenantDomain + '/oauth2/token?api-version=' + apiVersion, { form: data }, function ( e, resp, body ) {
    if ( e ) return callback( e, null );

    if ( resp.statusCode != 200 ) {
      try {
        var response = JSON.parse( body );
        if ( response.error ) {
          return callback( new OAuthError( response.error_description || response.error, response ), null );
        }
      }
        catch ( exp ) {}

      return callback( new OAuthError( body ), null );
    }

    var fullBody = JSON.parse( body );
    callback( null, fullBody.access_token );
  });
};

authenticator.getGraphClient = function ( tenantDomain, clientId, clientSecret, cache ) {
  var apiVersion = '2013-11-08';
  return Q.nfcall( authenticator.getAccessTokenWithClientCredentials, tenantDomain, clientId, clientSecret, apiVersion ).then(function ( token ) {
    return new GraphClient({ tenant: tenantDomain, accessToken: token, apiVersion: apiVersion, cache: cache });
  });
};