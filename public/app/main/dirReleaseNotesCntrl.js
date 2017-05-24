angular.module( 'app' ).controller( 'dirReleaseNotesCntrl', function ( $scope, dirReleaseNotes ) {
  $scope.notes = dirReleaseNotes.query();
});
