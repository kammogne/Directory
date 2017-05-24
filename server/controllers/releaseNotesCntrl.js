var
winston = require( 'winston' ),
mongoose = require( 'mongoose' ),
ReleaseNotes = mongoose.model( 'ReleaseNotes' );

exports.getAll = function ( req, res ) {
  ReleaseNotes.find().sort( { versionNumber: -1 } ).lean().exec( function ( err, notes ) {
    if ( err ) {
      winston.error( "release notes getAll : %s %s", err.message, err.stack, err );
      return;
    }
    res.send( notes );
  });
};
