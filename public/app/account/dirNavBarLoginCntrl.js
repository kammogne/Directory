angular.module( 'app' ).controller( 'dirNavBarLoginCntrl', function ( $scope, $window, dirIdentity ) {

  $scope.login = function () {
    $window.location.href = "/login";
  };

  $scope.logout = function () {
    $window.location.href = "/logout";
  };
});
