angular.module( 'app' ).factory( 'dirNews', function ( $resource ) {
  var NewsResource = $resource( '/api/news/:id', { id: "@name" });

  return NewsResource;
});
