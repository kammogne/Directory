angular.module( 'app' ).factory( 'dirReleaseNotes', function ( $resource ) {
  var ReleaseNotes = $resource( '/api/releaseNotes/:id', { id: "@versionNumber" });
  return ReleaseNotes;
});
