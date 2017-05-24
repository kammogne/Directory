/* global $, document */
angular.module( 'app' ).controller( 'dirMainCntrl', function ( $scope, dirNews, dirIdentity ) {
  $scope.news = dirNews.query();

  $scope.$on('$includeContentLoaded', function() {
      $(document).foundation();
  });
});
