angular.module( 'app' ).controller( 'dirUserListCntrl', function ( $scope, dirUser ) {
  $scope.users = dirUser.query();
});
