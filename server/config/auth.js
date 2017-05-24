var
passport = require( 'passport' ),
winston = require( 'winston' );

exports.authenticate = function ( req, res, next ) {
  winston.debug( 'auth.authenticate' );
  var auth = passport.authenticate( 'local', function ( err, user ) {
    if ( err ) { return next( err ); }
    if ( !user ) { res.send({ success: false }); }
    req.login( user, function ( err ) {
      if ( err ) { return next ( err ); }
      res.send({ success: true, user: user });
    });
  });
  auth( req,res,next );
};

exports.requiresApiLogin = function ( req, res, next ) {
  req.session.redirect_to = req.path;
  if ( !req.isAuthenticated()) {
    res.redirect( '/login' );
    res.end();
  } else {
    next();
  }
};

exports.requiresRole = function ( role ) {
  return function ( req, res, next ) {
    if ( !req.isAuthenticated() || req.user.roles.indexOf( role ) === -1 ) {
      res.status( 403 );
      res.end();
    } else {
      next();
    }
  };
};

exports.requiresAuthenticated = function () {
  return function ( req, res, next ) {
    if ( !req.isAuthenticated()) {
      res.status( 403 );
      res.end();
    } else {
      next();
    }
  };
};

exports.requiresManager = function ( req, res, next ) {
  var isMgr = (
    req.user.roles
    && req.config.managerRoles
    && req.user.roles.filter(function(userRole) { return (req.config.managerRoles.indexOf(userRole) != -1); }).length > 0
  );
  if ( !isMgr) {
    winston.warn('Unauthorized request; ' + JSON.stringify(req, null, 2));
    res.status( 403 );
    res.end();
  } else {
    next();
  }
};
