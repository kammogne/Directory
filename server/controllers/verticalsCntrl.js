var winston = require('winston'),
mongoose = require( 'mongoose' ),
Lookups = mongoose.model( 'Lookups' );

exports.getAll = function ( req, res ) {
  Lookups.findOne({name: 'verticals'},function ( err, verticals ) {
  	if(!verticals || !verticals.values){
  		verticals = { values:[]};
  	}
    res.send(verticals.values);
  });
};

exports.post = function(req, res){
	Lookups.findOne( {name: 'verticals'}, function(err, verticals){
		winston.log('info', 'posting vertical');

		if(!verticals){
			verticals = new Lookups();
			verticals.name = "verticals";
		}

		if(!verticals.values){
			verticals.values = [];
		}

		if ( verticals.values.filter(function(s) { return s.name === req.params.id;}).length > 0 ) {
			res.send( 400 );
			return;
		}

		verticals.values.push(req.body);

		verticals.save(function ( err, savedVertical ) {
			if ( err ){
				winston.log('error', 'error saving vertical ' + savedVertical.name);
				res.send( 500 );
			}
 	        res.send( req.body );
		});
	});
};

exports.delete = function ( req, res ) {
  Lookups.findOne( {name: 'verticals'}, function(err, verticals){
    if(!verticals || !verticals.values){
      res.send( {} );
      return;
    }

    var entries = verticals.values.filter(function(s) { return s.name === req.params.id;});

    if ( entries.length > 1 ) {
      res.send( 500 );
      return;
    }

    if ( entries.length < 1 ) {
      res.send( {} );
      return;
    }

    var entry = entries[0];
    verticals.values.splice( verticals.values.indexOf(entry), 1 );

    winston.warn(verticals.values.indexOf(entry));

    verticals.save(function ( err ) {
      if ( err ) res.send( 500 );
      res.send( {} );
    });
  });
};
