var
mongoose = require( 'mongoose' );

if ( mongoose.connection.readyState == 0 ) {
  mongoose.connect( 'mongodb://localhost/directory-test' );
  require( '../../server/models/Users' )();
  require( '../../server/models/Consultants' )();
}
