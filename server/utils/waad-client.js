var
Q = require( 'q' ),
request = require( 'request' ),
querystring = require( 'querystring' ),
winston = require( 'winston' );

module.exports = Waad10;

function Waad10( options ) {
  options = options || {};
  this.options = options;
  this.rootUrl = 'https://graph.windows.net/' + this.options.tenant;

  if ( !this.options.tenant ) {
    throw new Error( 'Must supply "tenant" id (16a88858-..2d0263900406) or domain (mycompany.onmicrosoft.com)' );
  }

  if ( !this.options.accessToken ) {
    throw new Error( 'Must supply "accessToken"' );
  }

  if ( this.options.fiddler ) {
    request = request.defaults({ 'proxy':'http://127.0.0.1:8888' });
  }
}

Waad10.prototype.getUrl = function ( url, qs ) {
  if ( typeof qs == 'undefined' ) {
    qs = {};
  }

  var dfd = Q.defer();

  var headers = {
    'Authorization': 'Bearer ' + this.options.accessToken,
  };

  qs[ 'api-version' ] = this.options.apiVersion;

  var fullUrl = url + '?' + querystring.stringify( qs );

  var cachedValue;
  if ( this.options.cache ) {
    cachedValue = this.options.cache.get( fullUrl );
  }

  if ( cachedValue && cachedValue.hasOwnProperty( fullUrl )) {
    dfd.resolve( cachedValue[ fullUrl ]);
  } else {

    winston.silly( 'Requesting ' + fullUrl );

    request({
      url: url,
      qs: qs,
      headers: headers
    }, function ( err, resp, body ) {
      if ( err ) {
        winston.log( "error", "err", err );
        dfd.reject( err );
        return;
      }

      if ( resp.statusCode != 200 ) {
        dfd.reject( new Error( body ));
        return;
      }

      var jsonBody = JSON.parse( body );

      if ( this.options.cache ) {
        this.options.cache.set( fullUrl, jsonBody );
      }

      dfd.resolve( jsonBody );
    }.bind( this ));
  }

  return dfd.promise;
};

Waad10.prototype.getUsers = function ( options ) {
  var qs = {};
  var url = this.rootUrl + '/users';

  if ( typeof options === 'object' ) {
    if ( options.top ) {
      qs.$top = options.top;
    }
    if ( options.skiptoken ) {
      qs.$skiptoken = options.skiptoken;
    }
  }

  return this.getUrl( url, qs ).then(function ( data ) {
    return data.value;
  });
};

Waad10.prototype.getUser = function ( objectIdOrUpn ) {
  var url = this.rootUrl + "/users/" + objectIdOrUpn;
  return this.getUrl( url );
};

Waad10.prototype.getGroups = function ( objectIdOrUpn ) {
  var url = this.rootUrl + '/users/' + objectIdOrUpn + '/$links/memberOf';
  return this.getUrl( url ).then(function ( data ) {
    return data.value;
  });
};


// https://graph.windows.net/mytenantdomain/users/<objectId||userPrincipalName>/$links/manager?api-version=2013-04-05
Waad10.prototype.getManager = function ( objectIdOrUpn ) {
  var url = this.rootUrl + '/users/' + objectIdOrUpn + '/$links/manager';
  return this.getUrl( url );
};
