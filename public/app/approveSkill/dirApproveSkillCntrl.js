angular.module( 'app' ).controller( 'dirApproveSkillCntrl', function ( $scope, $http, $routeParams, dirNotifier, dirIdentity, dirSkills, dirApproveSkill ) {
    $scope.skills = dirSkills.query();
    $scope.skillToApprove = new dirApproveSkill();
    $scope.currentUser = dirIdentity.currentUser;

    $http.get('/api/approveSkill/' + $routeParams.id)
        .success(function (data) {
            $scope.skillToApprove._id = data._id;
            $scope.skillToApprove.name = data.name;
            $scope.skillToApprove.description = data.description;
            $scope.skillToApprove.isApproved = data.isApproved;
        })
        .error(function () {
            $scope.skillLevels = [];
        });

    $scope.save = function () {
        $scope.skillToApprove.isApproved = true;
        $scope.skillToApprove.currentUser =  $scope.currentUser;
        $scope.skillToApprove.$save(function () {
            dirNotifier.notify( 'Skill has been approved successfully.');
        }, function () {
            dirNotifier.error( 'There was an error, try again later.' );
        });
    };
});