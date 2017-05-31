var winston = require('winston'),
    mongoose = require( 'mongoose' ),
    Lookups = mongoose.model( 'Lookups' );

exports.getAll = function ( req, res ) {
    Lookups.findOne({name: 'skills'},function ( err, skills ) {
        if(!skills || !skills.values){
            skills = { values:[]};
        }
        res.send( skills.values );
    });
};
//TODO: Landry refactor the logic to add the requested skill in the requestedSkills controller.
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

        var skillToSave = req.body;

        skillToSave.isApproved = false;

        skills.values.push(skillToSave);

        skills.save(function ( err, savedSkill ) {
            if ( err ){
                winston.log('error', 'error saving skill ' + savedSkill.name);
                res.send( 500 );
            }
            res.send( req.body );
        });
    });
};
