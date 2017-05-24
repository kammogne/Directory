var
express = require( 'express' ),
cors = require( 'cors' ),
stylus = require( 'stylus' ),
bodyParser = require( 'body-parser' ),
cookieParser = require( 'cookie-parser' ),
passport = require( 'passport' ),
session = require('express-session'),
MongoStore = require('connect-mongo')(session),
winston = require( 'winston' );


module.exports = function ( app, config ) {

  function compile( str, path ) {
    return stylus( str ).set( 'filename', path );
  }

  // Express native logger, uncomment if needed
  // ---------------------------------------------------------------------------
  //app.use(morgan({ format:'dev'}));

  app.set( 'views', config.rootPath + '/server/views' );
  app.set( 'view engine','jade' );

  // STATIC CONTENT COMPILERS
  // ---------------------------------------------------------------------------
  // This occurs first because they compile
  // static content to disk which the next
  // handler reads
  app.use( stylus.middleware(
  {
    src: config.rootPath + '/public',
    compile: compile
  }
  ));

  // STATIC CONTENT HANDLER
  // ---------------------------------------------------------------------------
  // This occurs BEFORE middleware so that
  // Middleware is not invoked for static reqs
  app.use( express.static( config.rootPath + '/public' ));

  // MIDDLEWARE
  // ---------------------------------------------------------------------------
  app.use(function ( req, res, next ) {
    winston.info( 'express: %s : %s', req.method, req.path, { method: req.method, path: req.path });
    next();
  });

  // Make configuration available to anything with
  // access to the request.
  app.use(function ( req, res, next ) {
    req.config = config;
    next();
  });


  app.use( bodyParser.urlencoded({ extended: true }));
  app.use( bodyParser.json());
  app.use( cookieParser());
  app.use( session({
    name: 'directory:session',
    secret: '3e2cc235-8050-48d5-ba3b-cd79000a5859',
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({
      url : config.db,
      auto_reconnect: true,
      autoRemove: 'interval',
      autoRemoveInterval: 10,
      socketOptions: {
          keepAlive: 1
      }
    })
  }));

  app.use( passport.initialize());
  app.use( passport.session());
  app.use( cors());
};
