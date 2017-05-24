angular.module('app', ['ngResource', 'ngRoute', 'ui.utils', 'ngCacheBuster'])
  .config([
    '$compileProvider',
    function ($compileProvider) {
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|skype|tel):/);
    }
  ])
  .config(function (httpRequestInterceptorCacheBusterProvider) {
    httpRequestInterceptorCacheBusterProvider.setMatchlist([/.*api.*/], true);
  })
  .config(function ($routeProvider, $locationProvider) {
    /* commented out -> grunt warning that it was declared and never used.
     var routeRoleChecks = {
     admin: {
     auth: function ( dirIdentity ) {
     return dirIdentity.isAuthorized( 'Some as yet undefined role' );
     }
     }
     };
     */

    $locationProvider.html5Mode(true);
    $routeProvider
      .when('/', {
        templateUrl: '/partials/main/main',
        controller: 'dirMainCntrl'
      })
      .when('/consultants', {
        templateUrl: '/partials/consultants/consultant-list',
        controller: 'dirConsultantListCntrl'
      })
      .when('/consultants/:id', {
        templateUrl: '/partials/consultants/consultant-view',
        controller: 'dirConsultantViewCntrl'
      })
      .when('/skills', {
        templateUrl: '/partials/skills/skill-add',
        controller: 'dirSkillsAddCntrl'
      })
      .when('/verticals', {
        templateUrl: '/partials/verticals/vertical-add',
        controller: 'dirVerticalsAddCntrl'
      })
      .when('/reports', {
        templateUrl: '/partials/reports/reports',
        controller: 'dirReportsCntrl'
      })
      .when('/releaseNotes', {
        templateUrl: '/partials/main/releasenotes',
        controller: 'dirReleaseNotesCntrl'
      });
  });

angular.module('app')
  .run(function ($rootScope, $location, dirIdentity) {
    $rootScope.$on('$routeChangeError', function (evt, current, previous, rejection) {
      if (rejection === 'not authorized') {
        $location.path('/');
      }
    });

    $rootScope.identity = dirIdentity;
});
