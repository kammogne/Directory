var
express = require('express'),
winston = require('winston');

var app = express();

// Configuration
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = require('./server/config/config')(env);

// Setup logger
require("./server/config/winston")(config);

// Setup Express web server
require("./server/config/express")(app, config);

// Mongoose & Schemas
require("./server/config/mongoose")(config);
require("./server/models/Users")();
require("./server/models/Consultants")();
require("./server/models/Lookups")();
require("./server/models/ReleaseNotes")();

// AuthN
require("./server/config/passport")(config);

// Routing
require("./server/config/routes")(app, config);

// Release Notes (push/update hard-coded release notes into database)
require("./server/config/releaseNotes")();

// Timer Events
var ad = require("./server/controllers/adCntrl");
var ldap = require("./server/utils/ldap");
ldap.setup( config.ldap );
//ad.refreshNow( config );
//ad.createTimerEvent( config );

app.listen(config.port);
winston.info('Listening on port ' + config.port + '...');
