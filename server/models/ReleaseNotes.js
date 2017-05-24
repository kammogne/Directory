var
mongoose = require( 'mongoose' ),
winston = require( 'winston' );

module.exports = function () {
  winston.debug( 'creating ReleaseNotes model' );

  var consultantsSchema = mongoose.Schema({
    versionNumber: {
      type: String,
      lowercase: true,
      trim: true,
      index: { unique: true }
    },
    features:[{
      description: String,
      developerGitHub: [String]
    }],
    bugFixes:[{
      description: String,
      developerGitHub: [String]
    }]
  });

  mongoose.model( 'ReleaseNotes', consultantsSchema );
};
