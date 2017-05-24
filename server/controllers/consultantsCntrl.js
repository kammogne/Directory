var winston = require( 'winston' ),
ldap = require( '../utils/ldap' ),
mongoose = require( 'mongoose' ),
Consultants = mongoose.model( 'Consultants' );


function publicView( fullConsultant ) {
  var maskedConsultant = {
    adId: fullConsultant.adId,
    firstName: fullConsultant.firstName,
    lastName: fullConsultant.lastName,
    email: fullConsultant.email,
    enterprise: fullConsultant.enterprise,
    manager: fullConsultant.manager.name,
    skills: fullConsultant.skills,
    verticals: fullConsultant.verticals
  };

  // Handle that publicDisclosure may not be present
  if ( fullConsultant.publicDisclosure && fullConsultant.publicDisclosure.socialMedia ) {
    maskedConsultant.socialMedia = fullConsultant.socialMedia;
  }

  return maskedConsultant;
}

exports.publicGet = function ( req, res ) {
  Consultants.findByEmailNicknameOrAdIdPublic( req.params.id, function ( err, consultant ) {
    if ( err ) {
      winston.error("Error getting all consultants for public api", err);
      res.send( 500 );
      return;
    }

    res.send( publicView(consultant) );
  });
};

exports.publicGetAll = function ( req, res ) {
  Consultants.findAllPublic( function ( err, consultants ) {
    if ( err ) {
      winston.error("Error getting all consultants for public api", err);
      res.send( 500 );
      return;
    }

    res.send( consultants.map( publicView ) );
  });
};


function isManager (req) {
  winston.info('consultantsCntrl - isManager(req)');
  return isInRole(req.user.roles, req.config.managerRoles);
};

function isInRole ( userRoles, managerRoles ) {
  //winston.info('consultantsCntrl - isInRole(userRoles, managerRoles)');
  //winston.info('consultantsCntrl - isInRole - userRoles' + userRoles);
  //winston.info('consultantsCntrl - isInRole - managerRoles: ' + managerRoles);
  var result = (
    userRoles
    && managerRoles
    && userRoles.filter(function(n) { return (managerRoles.indexOf(n) != -1); }).length > 0
  );
  //winston.info('consultantsCntrl - isInRole - returning: ' + result);
  return result;
};

exports.getAll = function ( req, res ) {
  Consultants.findAll(function ( err, collection ) {
    if ( err ) {
      winston.error("Error getting all consultants for private api", err);
      res.send( 500 );
      return;
    }

    res.send( collection );
  });
};

exports.get = function ( req, res ) {
  Consultants.findByEmailNicknameOrAdId( req.params.id, function ( err, consultant ) {
    if ( consultant === null ) {
      res.send( 404 );
      return;
    }

    var c = consultant.toObject();

    var isMgr = isManager(req);
    if (!isMgr)
      c.careerValuationTools = undefined;

    Consultants.findByManagerAdId( consultant.adId, function ( err, reports ) {
      c.reports = reports;
      res.send( c );
    });
  });
};

// function stringify (consultant) {
//   var value = JSON.stringify(consultant, null, 2);
//
//   // Condense CVT Categories
//   var regexp1 = /{\s*"name": "(.*?)",\s*"ideal": (\d*),\s*"current": (\d*),\s*"_id": "(.*?)"\s*}/g;
//   var newSubStr1 = '{ "name": "$1", "ideal": $2, "current": $3, "_id": "..." }';
//   var value = value.replace(regexp1, newSubStr1);
//
//   return value;
// }

exports.post = function ( req, res ) {
  var isMgr = isManager(req);

  if ( req.user.adId != req.body.adId &&
       !isMgr ) {
    res.send( 403 );
    return;
  }

  Consultants.findByEmailNicknameOrAdId( req.params.id, function ( err, consultant ) {
    var ad = req.body.ad;
    consultant.socialMedia = req.body.socialMedia;
    consultant.ad = ad;
    consultant.publicDisclosure = req.body.publicDisclosure;
    consultant.skills = req.body.skills;
    consultant.verticals = req.body.verticals;
    if (isMgr)
      consultant.careerValuationTools = req.body.careerValuationTools;

    var fields = [
      [ 'streetAddress', 'address' ],
      [ 'l', 'city' ],
      [ 'st', 'state' ],
      [ 'postalCode', 'postalCode' ],
      [ 'co', 'country' ],
      [ 'mobile', 'mobilePhone' ],
      [ 'homePhone', 'homePhone' ],
      [ 'telephoneNumber', 'clientPhone' ]
    ];

    // ldap.usingClient( function ( client ) {
    //   client.updateByUpn( consultant.email, function ( ldapUser ) {
    //     for ( var field in fields ) {
    //       if ( ad[ fields[field][1] ] === '' ) {
    //         delete ldapUser[ fields[field][0] ];
    //       } else {
    //         ldapUser[ fields[field][0] ] = ad[ fields[field][1] ];
    //       }
    //     }
    //     return ldapUser;
    //   });
    // }).catch(function ( err ) {
    //   winston.error( new Error(err) );
    //   res.send( 500 );
    //   return null;
    // }).then(function () {
       consultant.save(function ( err, savedConsultant ) {
         if ( err ) res.send( 500 );
         res.send( savedConsultant );
       });
    // }).done();
  });
};

exports.getCountsByEnterprise = function ( req, res ) {
  winston.info("consultantsCntrl.js - getCountsByEnterprise()");
  Consultants.getCountsByEnterprise(function ( err, data ) {
    if ( err ) {
      winston.error("consultantsCntrl.js - getCountsByEnterprise - Error getting all consultants for private api", err);
      res.send( 500 );
      return;
    }
    res.send( data );
  });
};

exports.getCvtCountsByQuarterAndEnterprise = function ( req, res ) {
  winston.info("consultantsCntrl.js - getCvtCountsByQuarterAndEnterprise()");
  Consultants.getCvtCountsByQuarterAndEnterprise(function ( err, data ) {
    if ( err ) {
      winston.error("consultantsCntrl.js - getCvtCountsByQuarterAndEnterprise - Error getting all consultants for private api", err);
      res.send( 500 );
      return;
    }
    res.send( data );
  });
};
