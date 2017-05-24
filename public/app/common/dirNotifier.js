angular.module( 'app' ).value( 'dirToastr', toastr );

angular.module( 'app' ).factory( 'dirNotifier', function ( dirToastr ) {
  return {
    notify: function ( msg ) {
      dirToastr.success( msg );
      console.log( "SUCCESS: " + msg );
    },
    warning: function ( msg ) {
      dirToastr.warning( msg );
      console.log( "WARNING: " + msg );
    },
    error: function ( msg ) {
      dirToastr.error( msg );
      console.log( "ERROR: " + msg );
    }
  };
});
