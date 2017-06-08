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

  lookupsSchema.statics.findSkill = function ( skillName, callback ) {
      var criteria = findCriteria();
      criteria["values.name"] = skillName;
      return this.find( criteria ).lean().exec( callback );
    };

  mongoose.model( 'Lookups', lookupsSchema );

};
