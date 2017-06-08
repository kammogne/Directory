var winston = require('winston'),
    mongoose = require( 'mongoose' ),
    lookups = mongoose.model( 'Lookups' ),
    https = require('https');

exports.get = function ( req, res ) {
    lookups.findSkill( req.params.id, function ( err, skill ) {
        if ( err ) {
            winston.error("Error No skill found", err);
            res.send( 500 );
            return;
        }

        res.send( skill );
    });
};
exports.post = function(req, res){

};