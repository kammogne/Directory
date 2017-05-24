angular.module('app').controller('dirConsultantListCntrl', function ($scope, $http, dirConsultants) {

    function getName(x) {
        return x.name;
    };

    function enterpriseMatch(enterprise) {
        return !$scope.selectedOffice || $scope.selectedOffice === enterprise;
    };

    function skillMatch(skills) {
        if (!$scope.selectedSkill) return true;
        return skills && skills.map(getName).indexOf($scope.selectedSkill) > -1; 
    };

    function verticalMatch(verticals) {
        if (!$scope.selectedVertical) return true;
        return verticals && verticals.map(getName).indexOf($scope.selectedVertical) > -1; 
    };

    $scope.refresh = function () {
        $scope.consultants = dirConsultants.query();
    };

    $scope.delete = function (consultant) {
        consultant.$delete();
        $scope.refresh();
    };

    $scope.refresh();

    $http.get('/api/locations')
        .success(function (data) {
            $scope.offices = data;
        })
        .error(function () {
            $scope.offices = [];
        });

    $http.get('/api/skills')
        .success(function (data) {
            $scope.skills = data.map(getName);
        })
        .error(function(){
            $scope.skills = [];
        });

    $http.get('/api/verticals')
        .success(function (data) {
            $scope.verticals = data.map(getName);
        })
        .error(function(){
            $scope.verticals = [];
        });

    $scope.filterPredicate = {};
    $scope.orderPredicate = 'lastName';
    $scope.reverse = false;
    $scope.selectedOffice = '';
    $scope.selectedSkill = '';
    $scope.selectedVertical = '';

    $scope.consultantFilter = function(consultant) {
        return enterpriseMatch(consultant.enterprise) 
            && skillMatch(consultant.skills) 
            && verticalMatch(consultant.verticals);
    };
});

angular.module('app').filter('nameSearch', function () {
    return function (items, search) {
        var cleanSearch = ( search || '' ).toLowerCase();
        var filtered = items.filter(function (i) {
            return ( i.firstName && i.firstName.toLowerCase().indexOf(cleanSearch) > -1 ) ||
                ( i.lastName && i.lastName.toLowerCase().indexOf(cleanSearch) > -1 );
        });
        return filtered;
    };
});