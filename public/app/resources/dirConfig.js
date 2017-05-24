angular.module( 'app' ).service( 'dirConfig', function ( $resource ) {
  //Service - that makes this singleton

  var config = null;

  this.getConfig = function() {
    // Lazy-load (eager-load interferes with login callback redirect)
    if (config == null)
      config = $resource( '/api/config').get();

    return config;
  }

});
