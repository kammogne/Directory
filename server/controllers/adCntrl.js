var Q = require( 'q' ),
    mongoose = require( 'mongoose' ),
    Consultants = mongoose.model( 'Consultants' ),
    graph = require( '../utils/graph' ),
    ldap = require( '../utils/ldap' ),
    winston = require( 'winston'),
    _ = require('lodash');

function getLdapProperties() {
    var findDeferred = Q.defer();

    Consultants.find({}).exists('email').exec( findDeferred.makeNodeResolver() );

    return findDeferred.promise.then(function ( consultants ) {
        // Run the LDAP retrieval sequentially,
        // as we can't handle multiple searches at once
        var result = Q({});

        consultants.forEach(function ( consultant ) {
            result = result.then(function () {
                return ldap.usingClient(function ( client ) {
                    return client.searchByUpn( consultant.email ).then(function ( ldapUser ) {
                        if (ldapUser === null) return;

                        consultant.ad = {
                            address: ldapUser.streetAddress || '',
                            city: ldapUser.l || '',
                            state: ldapUser.st || '',
                            postalCode: ldapUser.postalCode || '',
                            country: ldapUser.co || '',
                            mobilePhone: ldapUser.mobile || '',
                            homePhone: ldapUser.homePhone || '',
                            clientPhone: ldapUser.telephoneNumber || ''
                        };

                        var saveDeferred = Q.defer();
                        consultant.save( saveDeferred.makeNodeResolver() );
                        return saveDeferred.promise;
                    });
                });
            });
        });

        return result;
    });
}

function deactivateConsultantsMissingFromAdRefresh(updatedAt, retVal) {
    var deactivatedConsultants = Q.defer();

    Consultants.deactivateConsultantsMissingFromAdRefresh( updatedAt, deactivatedConsultants.makeNodeResolver() );

    return deactivatedConsultants.promise.then(function ( consultantCount ) {
        retVal.deactivated = consultantCount;
    });
}

function saveConsultant( u, config, updatedAt, retVal ) {
    var dfd = Q.defer();
    var consultant = {
        email: u.userPrincipalName.toLowerCase(),
        emailNickname: u.mailNickname.toLowerCase(),
        firstName: u.givenName,
        lastName: u.surname,
        adId: u.objectId,
        roles: [],
        lastUpdatedAt: updatedAt,
        enabled: u.accountEnabled
    };

    graph.getManagerForUserByAdId( config, consultant.adId ).then(function ( manager ) {
        consultant.manager = {
            name: manager.displayName,
            emailNickname: manager.mailNickname.toLowerCase(),
            adId: manager.objectId
        };
    }).catch(function () {
        consultant.manager = { name: 'unknown' };
        return;
    }).then(function () {

        return graph.getRolesForUserByAdId( config, consultant.adId ).then(function ( roles ) {

            var compacted = _.compact(roles);

            if(compacted.length) {
                consultant.roles = compacted.map(function (role) {
                    return role.displayName;
                });
            }


            var enterpriseRoles = consultant.roles.filter(function ( r ) {
                return ( /Enterprise/g ).test( r );
            });

            // If they aren't a member of 'Active Employees' then
            // drop them entirely.
            // Also drop out if they don't have an Enterprise.
            // Also drop out if they have no roles at all.
            if ( consultant.roles.length === 0 ||
                enterpriseRoles.length === 0 ||
                consultant.roles.indexOf( 'Active Employees' ) === -1 ) {
                dfd.resolve();
                return;
            }

            consultant.enterprise = enterpriseRoles[ 0 ].replace( "Enterprise-","" );
            Consultants.update({ adId: consultant.adId }, consultant, { upsert: true }, function ( err ) {
                if ( err ) {
                    winston.warn( err );
                    winston.info('deleting consultant: ' + consultant.emailNickname);

                    var criteria = { '$or': [
                        { emailNickname: consultant.emailNickname},
                        { adId: consultant.adId }
                    ]};

                    Consultants.remove(criteria, function(err, results){
                        if( err ) {
                            winston.info('tried deleting consultant: ' + consultant.emailNickname);
                            winston.warn('but got this: ' + err );
                            dfd.reject(err);
                        }
                        else {
                            winston.info('deleted consultant: ' + consultant.emailNickname);
                            retVal.deletedCount += 1;
                            dfd.resolve();
                        }
                    });
                } else {
                    retVal.updateCount += 1;
                    dfd.resolve();
                }});
        });
    }).catch(function ( err ) {
        dfd.reject( err );
    });

    return dfd.promise;
}

function refreshFromAD( config ) {
    winston.warn("Starting Refresh from Active Directory");
    var retVal = {
        updateCount: 0,
        deactivated: 0,
        deletedCount:0
    };
    var updatedAt = new Date();

    return graph.getUsers( config )
        .then(function ( users ) {
            // Create a promise for each potential save
            var promises = users.filter(function ( user ) {
                // Remove all users without a last name
                // they just slow down everything to come.
                return ( user.surname !== null );
            }).map(function ( user ) {
                return Q.delay(1000).then(saveConsultant( user, config, updatedAt, retVal ));
            });

            return Q.allSettled( promises ).spread(function () {
                winston.debug( "All Graph updates performed" );
            });
        }).then(function () {
            return getLdapProperties( config.ldap );
        })
        .then(deactivateConsultantsMissingFromAdRefresh( updatedAt, retVal ))
        .then(function () {
            winston.info(retVal);
            return retVal;
        });
}

exports.refreshNow = function ( config ) {
    return refreshFromAD( config ).done();
};

exports.createTimerEvent = function ( config ) {
    winston.warn("Creating Active Directory Timer Event");
    setInterval(function () {
        refreshFromAD( config );
    }, 15 * 60 * 1000);
};

exports.refresh = function ( req, res ) {
    refreshFromAD( req.config ).catch(function (err) {
        winston.error(err);
        res.send( 500 );
    }).then(function ( retVal ) {
        res.send( retVal );
    }).done();
};
