var
winston = require( 'winston' ),
mongoose = require( 'mongoose' ),
ReleaseNotes = mongoose.model( 'ReleaseNotes' );

module.exports = function () {

  ReleaseNotes.update({ versionNumber: '1.3.2.0' }, {
    features: [
      {
        description: 'Store CVT (Career Valuation Tool) entries with consultant',
        developerGitHub: ['mitchterlisner']
      },
    ],
    bugFixes: [
      // {
      //   description: 'Remove Verticals and Skills from desktop view due to space concerns',
      //   developerGitHub: ['timburga']
      // }
    ]
  }, { upsert: true }, function (err) {
      if (err) {
          winston.error('Unable to create release notes', err);
      }
      winston.info('Version 1.3.2.0 release notes');
  });

  ReleaseNotes.update({ versionNumber: '1.3.1.0' }, {
    features: [
      {
        description: 'Display Verticals and Skills on mobile view',
        developerGitHub: [ 'timburga' ]
      }
    ],
    bugFixes:[
      {
        description: 'Remove Verticals and Skills from desktop view due to space concerns',
        developerGitHub: [ 'timburga' ]
      }
    ]
  }, { upsert: true}, function (err) {
    if (err) {
      winston.error( 'Unable to create release notes', err);
    }
    winston.info( 'Version 1.3.1.0 release notes' );
  });

  ReleaseNotes.update({ versionNumber: '1.3.0.0' }, {
    features: [
      {
        description: 'Asssociate Verticals with Consultant',
        developerGitHub: [ 'timburga' ]
      },
      {
        description: 'Manage Verticals',
        developerGitHub: [ 'timburga' ]
      },
      {
        description: 'Add Skills and Verticals to public API',
        developerGitHub: [ 'timburga' ]
      },
      {
        description: 'Remove Skills and Verticals from disclosure protection',
        developerGitHub: [ 'timburga' ]
      },
      {
        description: 'Consultant List - allow filtering by Vertical and add record count',
        developerGitHub: [ 'timburga' ]
      }
    ],
    bugFixes:[]
  }, { upsert: true }, function ( err ) {
    if ( err ) {
      winston.error( "Unable to create release notes", err );
      return;
    }
    winston.info( 'Version 1.3.0.0 release notes' );
  });

  ReleaseNotes.update({ versionNumber: '1.2.0.0' }, {
    features:[
      {
        description: 'Manage Skills',
        developerGitHub: [ 'trayburn', 'bforrest' ]
      },
      {
        description: 'Associate Skills with Consultant',
        developerGitHub: [ 'bforrest' ]
      },
      {
        description: 'Public API',
        developerGitHub: [ 'trayburn' ]
      },
      {
        description: 'Updates to application internals',
        developerGitHub: [ 'trayburn' ]
      },
      {
        description: 'Need AD groups to distinguish : Recruiters, VPs (and above), IT Staff, and various practices',
        developerGitHub: [ 'trayburn' ]
      },
      {
        description: 'Allow managers to edit other peoples directory information',
        developerGitHub: [ 'trayburn' ]
      },
      {
        description: 'Opt-in for sharing of social media information',
        developerGitHub: [ 'trayburn' ]
      },
      {
        description: 'Added Minneapolis Enterprise',
        developerGitHub: [ 'trayburn' ]
      }
    ],
    bugFixes:[
      {
        description: 'Top Navigation does not close on navigate in mobile view',
        developerGitHub: [ 'trayburn' ]
      }
    ]
  }, { upsert: true }, function ( err ) {
    if ( err ) {
      winston.error( "Unable to create release notes", err );
      return;
    }
    winston.info( 'Version 1.2.0.0 release notes' );
  });

  ReleaseNotes.update({ versionNumber: '1.1.1.1' }, {
    features:[],
    bugFixes:[
    {
      description: 'Fixed an error with disabling consultants',
      developerGitHub: [ 'coridrew' ]
    }
    ]
  }, { upsert: true }, function ( err ) {
    if ( err ) {
      winston.error( "Unable to create release notes", err );
      return;
    }
    winston.info( 'Version 1.1.1.1 release notes' );
  });


  ReleaseNotes.update({ versionNumber: '1.1.1.0' }, {
    features:[],
    bugFixes:[
    {
      description: 'Correct an error in how Active Directory data was synchronized',
      developerGitHub: [ 'coridrew' ]
    },
    {
      description: 'Fix an error that stopped certain areas from being clicked',
      developerGitHub: [ 'bforrest' ]
    }
    ]
  }, { upsert: true }, function ( err ) {
    if ( err ) {
      winston.error( "Unable to create release notes", err );
      return;
    }
    winston.info( 'Version 1.1.1.0 release notes' );
  });

  ReleaseNotes.update({ versionNumber: '1.1.0.0' }, {
    features:[
      {
        description: 'Allow Managers to edit a consultants record',
        developerGitHub: [ 'trayburn' ]
      }
    ],
    bugFixes:[]
  }, { upsert: true }, function ( err ) {
    if ( err ) {
      winston.error( "Unable to create release notes", err );
      return;
    }
    winston.info( 'Version 1.1.0.0 release notes' );
  });

  ReleaseNotes.update({ versionNumber: '1.0.1.0' }, {
    features:[
      {
        description: 'Show phone numbers in grid',
        developerGitHub: [ 'trayburn' ]
      }
    ],
    bugFixes:[]
  }, { upsert: true }, function ( err ) {
    if ( err ) {
      winston.error( "Unable to create release notes", err );
      return;
    }
    winston.info( 'Version 1.0.1.0 release notes' );
  });


  ReleaseNotes.update({ versionNumber: '1.0.0.0' }, {
    features:[
      {
        description: 'Login with Active Directory',
        developerGitHub: [ 'trayburn' ]
      },
      {
        description: 'List all employees',
        developerGitHub: [ 'trayburn', 'coridrew' ]
      },
      {
        description: 'Sync with Active Directory',
        developerGitHub: [ 'trayburn' ]
      },
      {
        description: 'Update Active Directory',
        developerGitHub: [ 'trayburn' ]
      }
    ],
    bugFixes:[]
  }, { upsert: true }, function ( err ) {
    if ( err ) {
      winston.error( "Unable to create release notes", err );
      return;
    }
    winston.info( 'Version 1.0.0.0 release notes' );
  });

};
