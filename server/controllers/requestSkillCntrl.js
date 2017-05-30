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

exports.post = function(req, res){
    Lookups.findOne( {name: 'skills'}, function(err, skills){
        winston.log('info', 'send skill request email');

        if(!skills){
            skills = new Lookups();
            skills.name = "skills";
        }

        if(!skills.values){
            skills.values = [];
        }

        if ( skills.values.filter(function(s) { return s.name === req.params.id;}).length > 0 ) {
            res.send( 400 );
            return;
        }

        skills.values.push(req.body);

        skills.save(function ( err, savedSkill ) {
            if ( err ){
                winston.log('error', 'error saving skill ' + savedSkill.name);
                res.send( 500 );
            }
            res.send( req.body );
        });
    });
};
