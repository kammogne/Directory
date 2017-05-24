var
graph = require( '../utils/graph.js' ),
passport = require( 'passport' ),
winston = require( 'winston' ),
mongoose = require( 'mongoose' ),
WsfedStrategy = require( 'passport-azure-ad' ).WsfedStrategy,
Users = mongoose.model( "Users" );

module.exports = function ( config ) {
  config.passport.strategy = new WsfedStrategy( config.ad, function ( profile, done ) {
    winston.log( 'debug', 'inside wsfedstrategy' );
    // We will use email as the primary key for our users
    if ( !profile.email ) {
      return done( new Error( "No email found" ), null );
    }

    return Users.findByEmail( profile.email, function ( err, user ) {

      if ( err ) {
        return done( err );
      }

      if ( !user ) {
        user = new Users({});
      }

      user.copyFromProfile( profile );

      return graph.getRolesForUserByAdId( config, user.adId ).then(function ( groups ) {

        user.roles = groups.map(function ( r ) {
          return r.displayName;
        });

      }).then(function () {

        // Retrieve the Graph User to get emailNickname
        // No, you can't just split email on @, check
        // Mike Rousey's account for the reason why.
        return graph.getUser( config, user.adId ).then(function ( graphUser ) {
          user.emailNickname = graphUser.mailNickname.toLowerCase();
          console.log(user);
          return user;
        });

      }).then(function () {

        return user.save(function ( err, obj ) {
          if ( err ) {
            return done( err,null );
          }
          return done( null, obj );
        });

      }).done();
    });
  });

  passport.use( config.passport.strategy );


  passport.serializeUser(function ( user, done ) {
    winston.log( 'debug', 'passport.serializeUser' );
    if ( user ) { done( null, user._id ); }
  });

  passport.deserializeUser(function ( id, done ) {
    Users.findById( id, function ( err, user ) {
      if ( user ) {
        winston.log( 'silly', 'passport.deserializeUser' );
        return done( null, user );
      } else {
        return done( null, false );
      }
    });
  });

};
