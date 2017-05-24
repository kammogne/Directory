var
winston = require( 'winston' ),
mongoose = require( 'mongoose' ),
Lookups = mongoose.model( 'Lookups' );

exports.getAll = function ( req, res ) {
  Lookups.findOne({name: 'news'},function ( err, skills ) {
    if ( err ) {
      winston.error("news get all : %s %s", err.message, err.stack, err);
      return;
    }
    if(!skills || !skills.values){
      skills = { values:[] };
    }
    res.send( skills.values );
  });
};
