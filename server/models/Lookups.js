var
mongoose = require( 'mongoose' ),
winston = require( 'winston' );

module.exports = function () {
  winston.debug( 'creating Lookups model' );

  var lookupsSchema = mongoose.Schema({
    name: {
      type: String,
      lowercase: true,
      trim: true,
      index: { unique: true }
    },
    values: [{
        name: String,
        description: String,
        isApproved: Boolean
      }]
  });

  mongoose.model( 'Lookups', lookupsSchema );
};
