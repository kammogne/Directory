angular.module( 'app' ).service( 'dirIdentity', function ( $window, $log, dirConfig ) {
  var user;

  var _isManager = false;

  if ( !!$window.bootstrappedUserObject ) {
    user = {};
    angular.extend( user, $window.bootstrappedUserObject );
  }

  var isAuthenticated = function () {
    return user !== undefined;
  };
  var isInRole = function ( role ) {
    // $log.info('dirIdentity - isInRole(' + JSON.stringify(role) + ')');
    // $log.info('dirIdentity - isInRole - my roles: ' + JSON.stringify(user.roles));
    if (!user || !user.roles)
      return false;
    if (angular.isArray(role)) {
      var result = false;
      angular.forEach(role, function(r) { result = result || user.roles.indexOf( r ) > -1; });
      //$log.info('dirIdentity - isInRole - returning: ' + result);
      return result;
    }
    return user.roles.indexOf( role ) > -1;
  };
  var isManager = function () {
    return _isManager;
  };

  // Set isManager based on config-driven managerRoles
  if (isAuthenticated() && user.roles) {
    var config = dirConfig.getConfig();
    config.$promise.then(function() {
      _isManager = (config.managerRoles && isInRole(config.managerRoles))
      $log.info('dirIdentity - config.$promise.then - config: ' + JSON.stringify(config) + ', _isManager: '+ _isManager );
      //$timeout(function(){ /* do nothing, but triggers $scope.$apply() */ });
    });
  }

  return {
    currentUser: user,
    isAuthenticated: isAuthenticated,
    isInRole: isInRole,
    isManager: isManager
  };
});
