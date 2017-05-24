var
mongoose = require( 'mongoose' ),
winston = require( 'winston' );

module.exports = function ( config ) {

  // setup logging
  mongoose.set( 'debug', function ( collectionName, method ) {
    winston.debug( 'mongo collection: %s method: %s', collectionName, method );
  });

  var mongoOptions = {
    db: {
      safe: true
    },
    server: {
      auto_reconnect: true,
      socketOptions: {
        connectTimeoutMS: 3600000,
        keepAlive: 3600000,
        socketTimeoutMS: 3600000
      }
    }
  };

  mongoose.connect( config.db, mongoOptions );
  var db = mongoose.connection;
  db.on( 'error', console.error.bind( console, 'connection error...' ));
  db.once( 'open', function callback() {
    winston.info( 'database connection opened' );
  });
};
