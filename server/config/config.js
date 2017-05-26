var
_ = require('lodash'),
path = require( 'path' );


var environmentConfigs = {
  common:{
    rootPath: path.normalize( __dirname + '/../../' ),
    passport: {},
    ldap: {
      url: 'ldap://cloud-dc1.cloudapp.net',
      user: 'CN=Directory,OU=Dallas,OU=Improving Users,DC=improving,DC=local',
      password: '2c7b5b6138694e5f50772d364d',
      dc: 'dc=improving,dc=local'
    },
    ad: {
      // These two keys remain the same, even if the port number changes
      identityProviderUrl: 'https://login.windows.net/f2267c2e-5a54-49f4-84fa-e4f2f4038a2e/wsfed',
      identityMetadata: 'https://login.windows.net/f2267c2e-5a54-49f4-84fa-e4f2f4038a2e/federationmetadata/2007-06/federationmetadata.xml'
    },
    graph: {
      tenant: 'Improving.onmicrosoft.com'
    },
    winston: {
      level: 'info',
      silent: false,
      colorize: false,
      timestamp: false
    }
  },
  development:{
    db: 'mongodb://localhost:27017/Directory-Dev',
    port: process.env.PORT || 3000,
    ad: {
      // These two keys are supported at port 3000 & 4000 currently
      // in the Azure AD setup, more can be added if needed.
      realm: 'http://localhost:3000',
      logoutUrl: 'http://localhost:3000'
    },
    graph: {
      clientid: '88ccf307-75bc-44cf-889c-95d1e857d061',
      clientsecret: 'a5oRZdv3TVtWGU5AMH0dCD6YpRatcwEhbOW3jHzowyM='
    },
    winston: {
      colorize: true
    },
    managerRoles: [ 'Managers', 'Pigpen', 'Geek' ]
  },
  staging:{
    db: 'mongodb://ImprovingTech:fa748907-1135-4425-a9cd-118d903d499e@ds030827.mongolab.com:30827/Directory-Dev',
    port: process.env.PORT || 80,
    ad: {
      realm: 'http://directory-test.AzureWebsites.net',
      logoutUrl: 'http://directory-test.AzureWebsites.net'
    },
    graph: {
      clientid: '0ef37362-98cd-4896-bca7-944281a626b9',
      clientsecret: 'Mcctkfz5Wb1UbM6N6AoWDhwhsNRQNDF0RpiWyGJ9dDY='
    },
    winston: {
      level: 'debug'
    },
    managerRoles: [ 'Managers', 'Pigpen' ]
  },
  production:{
    db: 'mongodb://ImprovingTech:5e47bb65-f310-47a5-86ca-8e9edf8e9c5f@ds030817.mongolab.com:30817/Directory',
    port: process.env.PORT || 80,
    ad: {
      realm: 'http://Directory.ImprovingTech.com',
      logoutUrl: 'http://Directory.ImprovingTech.com'
    },
    graph: {
      clientid: '171b5483-d989-45d3-977b-88ab2b8bcc7f',
      clientsecret: 'YW1QxJ/ETfcQNzkD/U9+Y7FQqsQaaEFVvlvfdZDVT0M='
    },
    managerRoles: [ 'Managers' ]
  }
};

module.exports = function(env) {
  var config = _.merge({ }, environmentConfigs['common'], environmentConfigs[env]);
  config.getClientConfig = getClientConfig;
  // Cannot use winston; this is called before winston is set up
  //console.log('config: ' + JSON.stringify( config, null, 2 ));
  return config;
}

function getClientConfig() {
  //console.log('this: ' + JSON.stringify( this, null, 2 ));
  // Whitelist the config settings which should be passed to the client
  var clientConfig = {
    managerRoles : this.managerRoles
  };
  //console.log('clientConfig: ' + JSON.stringify( clientConfig, null, 2 ));
  return clientConfig;
}
