angular.module( 'app' ).filter( 'skillSearch', function () {
  return function ( items, search ) {
    var cleanSearch = ( search || '' ).toLowerCase();
    var filtered = items.filter(function ( i ) {
      return ( i.name && i.name.toLowerCase().indexOf( cleanSearch ) > -1 );
    });
    return filtered;
  };
});