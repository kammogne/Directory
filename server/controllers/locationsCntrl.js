var
    mongoose = require( 'mongoose' ),
    Consultants = mongoose.model( 'Consultants' );

exports.getAll = function ( req, res ) {
  Consultants.find().distinct('roles', function ( err, roles ) {
    if ( err ) {
      winston.error("Error getting all locations for private api", err);
      res.send( 500 );
      return;
    }

    var locations = [];
    roles.map(function(role){
      if(role.startsWith('Enterprise-'))
      {
        locations.push(role.replace('Enterprise-',''));
      }
    });
    res.send( locations.sort() );
  });
};
