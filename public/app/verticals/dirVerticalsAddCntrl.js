angular.module( 'app' ).controller( 'dirVerticalsAddCntrl', function ( $scope, dirVerticals, dirNotifier ) {

  $scope.verticals = dirVerticals.query();
  $scope.newVertical = new dirVerticals();
  
  $scope.save = function () {
    $scope.newVertical.$save(function () {
      dirNotifier.notify( 'Vertical has been saved successfully.');
      $scope.verticals = dirVerticals.query();
      $scope.newVertical = new dirVerticals();
    }, function () {
      dirNotifier.error( 'There was an error, try again later.' );
    });
  };

  $scope.delete = function( vertical ) {
    console.log(vertical);
    vertical.$delete( function () {
      dirNotifier.notify( 'Vertical has been removed successfully.');      
    }, function () {
      dirNotifier.error( 'There was an error, try again later.' );
    });
    $scope.verticals = dirVerticals.query();
  };

});