/* global assert */

describe('dirConsultantViewCntrl', function () {

  // local variables for testing
  var $controller, $filter, $log, $q, dirNotifier;

  describe('contructor called', function () {
    var $scope;

    beforeEach(function () {
      module('app');
      inject(function (_$controller_, _$rootScope_, _$filter_, _$log_, _$q_, _dirNotifier_) {

        $controller = _$controller_;
        $scope = _$rootScope_.$new();
        var routeParams = {id: 'test.user'};
        $filter = _$filter_;
        $log = _$log_;
        $q = _$q_;
        var mockDirConsultants = {
          get: function (id) {
            return {
              firstName: 'principal',
              lastName: 'consultant'
            };
          }
        };
        var mockDirIdentity = {
          currentUser: {
            firstName: 'test',
            lastName: 'user'
          }
        };
        dirNotifier = _dirNotifier_;
        var mockDirSkills = {
          query: function () {
            return {
              name: 'Skills',
              values: [
                {name: 'Communication', description: ''},
                {name: 'Thinking', description: ''}
              ]
            };
          }
        };
        var mockDirVerticals = {
          query: function () {
            return {
              name: 'Verticals',
              values: [
                {name: 'Transportation and Warehousing', description: ''},
                {name: 'Finance and Insurance', description: ''}
              ]
            };
          }
        };
        $controller('dirConsultantViewCntrl', {$scope: $scope, $routeParams: routeParams,
          $filter: $filter, $log: $log, dirConsultants: mockDirConsultants,
          dirIdentity: mockDirIdentity, dirNotifier: dirNotifier, dirSkills: mockDirSkills,
          dirVerticals: mockDirVerticals});
        $scope.$apply();
      });
    });

    it('should have the default tab set to Active Directory', function () {
      expect($scope.tab).to.equals('tab-ad');
    });
    it('should have a consultant exist', function () {
      expect($scope.consultant).to.exist;
    });
    it('should have a consultant first name "principal"', function () {
      expect($scope.consultant.firstName).to.be.equal('principal');
    });
    it('should have a consultant last name "consultant"', function () {
      expect($scope.consultant.lastName).to.be.equal('consultant');
    });
    it('should have a user exist', function () {
      expect($scope.user).to.exist;
    });
    it('should have a user first name "test"', function () {
      expect($scope.user.firstName).to.be.equal('test');
    });
    it('should have a user last name "user"', function () {
      expect($scope.user.lastName).to.be.equal('user');
    });
    it('should have skills exist', function () {
      expect($scope.skills).to.exist;
    });
    it('should have a skill "Communication"', function () {
      assert.include($scope.skills.values, {name: 'Communication', description: ''});
    });
    it('should have a skill "Thinking"', function () {
      assert.include($scope.skills.values, {name: 'Thinking', description: ''});
    });
    it('should have verticals exist', function () {
      expect($scope.verticals).to.exist;
    });
    it('should have a vertical "Transportation and Warehousing"', function () {
      assert.include($scope.verticals.values, {name: 'Transportation and Warehousing', description: ''});
    });
    it('should have a vertical "Finance and Insurance"', function () {
      assert.include($scope.verticals.values, {name: 'Finance and Insurance', description: ''});
    });
  });

  describe('isEditor called with user and consultant as the same', function () {
    var $scope;

    beforeEach(function () {
      module('app');
      inject(function (_$controller_, _$rootScope_, _$filter_, _$log_, _$q_, _dirNotifier_) {

        $controller = _$controller_;
        $scope = _$rootScope_.$new();
        var routeParams = {id: 'principal.consultant'};
        $filter = _$filter_;
        $log = _$log_;
        $q = _$q_;
        var mockDirConsultants = {
          get: function (id) {
            return {
              adId: '909d5bc8-da41-4e45-96f9-d218b8db3753',
              firstName: 'principal',
              lastName: 'consultant'
            };
          }
        };
        var mockDirIdentity = {
          currentUser: {
            adId: '909d5bc8-da41-4e45-96f9-d218b8db3753',
            firstName: 'principal',
            lastName: 'consultant'
          }
        };
        dirNotifier = _dirNotifier_;
        var mockDirSkills = {
          query: function () {}
        };
        var mockDirVerticals = {
          query: function () {}
        };
        $controller('dirConsultantViewCntrl', {$scope: $scope, $routeParams: routeParams,
          $filter: $filter, $log: $log, dirConsultants: mockDirConsultants,
          dirIdentity: mockDirIdentity, dirNotifier: dirNotifier, dirSkills: mockDirSkills,
          dirVerticals: mockDirVerticals});
        $scope.$apply();
      });
    });

    it('should have isEditor as true', function () {
      expect($scope.isEditor()).to.be.true;
    });

  });

  describe('isEditor called with user and consultant are different', function () {
    var $scope;

    beforeEach(function () {
      module('app');
      inject(function (_$controller_, _$rootScope_, _$filter_, _$log_, _$q_, _dirNotifier_) {

        $controller = _$controller_;
        $scope = _$rootScope_.$new();
        var routeParams = {id: 'test.user'};
        $filter = _$filter_;
        $log = _$log_;
        $q = _$q_;
        var mockDirConsultants = {
          get: function (id) {
            return {
              adId: '909d5bc8-da41-4e45-96f9-d218b8db3753',
              firstName: 'principal',
              lastName: 'consultant'
            };
          }
        };
        var mockDirIdentity = {
          currentUser: {
            adId: 'a35e93b0-dd74-4ce0-ba73-d2952de93bb0',
            firstName: 'test',
            lastName: 'user'
          },
          isManager: function () {
            return false;
          }
        };
        dirNotifier = _dirNotifier_;
        var mockDirSkills = {
          query: function () {}
        };
        var mockDirVerticals = {
          query: function () {}
        };
        $controller('dirConsultantViewCntrl', {$scope: $scope, $routeParams: routeParams,
          $filter: $filter, $log: $log, dirConsultants: mockDirConsultants,
          dirIdentity: mockDirIdentity, dirNotifier: dirNotifier, dirSkills: mockDirSkills,
          dirVerticals: mockDirVerticals});
        $scope.$apply();
      });
    });

    it('should have isEditor as false', function () {
      expect($scope.isEditor()).to.be.false;
    });

  });

  describe('isEditor called with user as a manager', function () {
    var $scope;

    beforeEach(function () {
      module('app');
      inject(function (_$controller_, _$rootScope_, _$filter_, _$log_, _$q_, _dirNotifier_) {

        $controller = _$controller_;
        $scope = _$rootScope_.$new();
        var routeParams = {id: 'test.user'};
        $filter = _$filter_;
        $log = _$log_;
        $q = _$q_;
        var mockDirConsultants = {
          get: function (id) {
            return {
              adId: '909d5bc8-da41-4e45-96f9-d218b8db3753',
              firstName: 'principal',
              lastName: 'consultant'
            };
          }
        };
        var mockDirIdentity = {
          currentUser: {
            adId: 'a35e93b0-dd74-4ce0-ba73-d2952de93bb0',
            firstName: 'test',
            lastName: 'user'
          },
          isManager: function () {
            return true;
          }
        };
        dirNotifier = _dirNotifier_;
        var mockDirSkills = {
          query: function () {}
        };
        var mockDirVerticals = {
          query: function () {}
        };
        $controller('dirConsultantViewCntrl', {$scope: $scope, $routeParams: routeParams,
          $filter: $filter, $log: $log, dirConsultants: mockDirConsultants,
          dirIdentity: mockDirIdentity, dirNotifier: dirNotifier, dirSkills: mockDirSkills,
          dirVerticals: mockDirVerticals});
        $scope.$apply();
      });
    });

    it('should have isEditor as true', function () {
      expect($scope.isEditor()).to.be.true;
    });

  });

  describe('call selectCvt', function () {
    var $scope;

    beforeEach(function () {
      module('app');
      inject(function (_$controller_, _$rootScope_, _$filter_, _$log_, _$q_, _dirNotifier_) {

        $controller = _$controller_;
        $scope = _$rootScope_.$new();
        var routeParams = {id: 'test.user'};
        $filter = _$filter_;
        $log = _$log_;
        $q = _$q_;
        var mockDirConsultants = {
          get: function (id) {
            return {};
          }
        };
        var mockDirIdentity = {
          currentUser: {}
        };
        dirNotifier = _dirNotifier_;
        var mockDirSkills = {
          query: function () {}
        };
        var mockDirVerticals = {
          query: function () {}
        };
        $controller('dirConsultantViewCntrl', {$scope: $scope, $routeParams: routeParams,
          $filter: $filter, $log: $log, dirConsultants: mockDirConsultants,
          dirIdentity: mockDirIdentity, dirNotifier: dirNotifier, dirSkills: mockDirSkills,
          dirVerticals: mockDirVerticals});
        $scope.$apply();
      });
    });

    it('should save an object to selectedCvt', function () {
      $scope.selectCvt({});
      expect($scope.selectedCvt).to.exist;
    });
  });

  describe('call addCvt', function () {
    var $scope;

    beforeEach(function () {
      module('app');
      inject(function (_$controller_, _$rootScope_, _$filter_, _$log_, _$q_, _dirNotifier_) {

        $controller = _$controller_;
        $scope = _$rootScope_.$new();
        var routeParams = {id: 'test.user'};
        $filter = _$filter_;
        $log = _$log_;
        $q = _$q_;
        var mockDirConsultants = {
          get: function (id) {
            return {
              addCvt: function () {
                return {
                  'date': '2016-01-01',
                  'categories': [
                    {'name': 'Professional Fit', 'ideal': '', 'current': ''},
                    {'name': 'Personal Fit', 'ideal': '', 'current': ''},
                    {'name': 'Cultural Fit', 'ideal': '', 'current': ''},
                    {'name': 'Growth & Learning', 'ideal': '', 'current': ''},
                    {'name': 'Recognition', 'ideal': '', 'current': ''},
                    {'name': 'Financial', 'ideal': '', 'current': ''}
                  ]
                };
              }
            };
          }
        };
        var mockDirIdentity = {
          currentUser: {}
        };
        dirNotifier = _dirNotifier_;
        var mockDirSkills = {
          query: function () {}
        };
        var mockDirVerticals = {
          query: function () {}
        };
        $controller('dirConsultantViewCntrl', {$scope: $scope, $routeParams: routeParams,
          $filter: $filter, $log: $log, dirConsultants: mockDirConsultants,
          dirIdentity: mockDirIdentity, dirNotifier: dirNotifier, dirSkills: mockDirSkills,
          dirVerticals: mockDirVerticals});
        $scope.$apply();
      });
    });

    it('should save a new CVT to selectedCvt', function () {
      $scope.addCvt();
      expect($scope.selectedCvt).to.exist;
      expect($scope.selectedCvt).to.have.property('date', '2016-01-01');
      expect($scope.selectedCvt.categories.length).to.be.equals(6);
    });
  });

  describe('call save', function(){
    it('should save the consultant');
    it('should point selectedCVt as before');
  });
// used for checking $log information
//  afterEach('Write Log Messages', function () {
//    // Messages logged using $log.log()
//    console.log('log', $log.log.logs);
//
//    // Messages logged using $log.info()  
//    console.log('info', $log.info.logs);
//
//    // Messages logged using $log.warn()
//    console.log('warn', $log.warn.logs);
//
//    // Messages logged using $log.error()
//    console.log('error', $log.error.logs);
//
//    // Messages logged using $log.debug()
//    console.log('debug', $log.debug.logs);
//  });
});

