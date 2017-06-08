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

  function findCriteria() {
    return { enabled: true };
  }

  lookupsSchema.statics.findSkill = function ( criteria, callback ) {
    return this.findOne({ name: criteria}, callback );
  };

  mongoose.model( 'Lookups', lookupsSchema );

};
