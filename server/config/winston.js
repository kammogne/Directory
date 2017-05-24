/* exported winstonMongoDB */
var
winston = require( 'winston' ),
winstonMongoDB = require('winston-mongodb').MongoDB;

module.exports = function ( config ) {
  winston.remove( winston.transports.Console );
  winston.add( winston.transports.Console, config.winston );
  winston.add(winston.transports.MongoDB, {
    level: config.winston.level,
    collection: 'logs',
    dbUri: config.db,
    capped: true,
    cappedSize: 10 * 1024 * 1024 // 10MB
  });
};
