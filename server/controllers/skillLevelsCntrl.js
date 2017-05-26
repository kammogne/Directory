var winston = require('winston'),
    mongoose = require( 'mongoose' ),
    Lookups = mongoose.model( 'Lookups' );

exports.getAll = function ( req, res ) {
    Lookups.findOne({name: 'skilllevels'},function ( err, skills ) {
        if(!skills || !skills.values){
            skills = { values:[]};
        }
        res.send( skills.values );
    });
};
