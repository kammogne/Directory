var
winston = require('winston'),
mongoose = require( 'mongoose' ),
graph = require( './server/utils/graph.js' );

// Configuration
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = require('./server/config/config')[env];

// Setup logger
require("./server/config/winston")(config);

// waad-client
var waad = require("./server/utils/waad-auth");

// Mongoose & Schemas
require("./server/config/mongoose")(config);
require("./server/models/Users")();
require("./server/models/Consultants")();
require("./server/models/Lookups")();
require("./server/models/ReleaseNotes")();

// Create variables for all Models
var
Users = mongoose.model( "Users" ),
Consultants = mongoose.model( "Consultants" ),
Lookups = mongoose.model("Lookups"),
ReleaseNotes = mongoose.model("ReleaseNotes");

// Helper Functions
var result = undefined;

function toConsole(err, obj) {
  if (err) {
    winston.error(err);
  } else {
    console.log(obj);
  }
}

function toResult(err, obj) {
  if (err) {
    winston.error(err);
  } else {
    result = obj;
    console.log(result);
  }
}

function createClient() {
  return waad.getGraphClient( config.graph.tenant, config.graph.clientid, config.graph.clientsecret);
}
