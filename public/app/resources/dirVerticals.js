angular.module( 'app' ).factory( 'dirVerticals', function ( $resource ) {
  var VerticalsResource = $resource( '/api/verticals/:id', { id: "@name" });

  return VerticalsResource;
});
