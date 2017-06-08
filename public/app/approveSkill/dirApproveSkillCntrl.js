angular.module( 'app' ).controller( 'dirApproveSkillCntrl', function ( $scope, $http, $routeParams, dirNotifier, dirIdentity, dirSkills, dirApproveSkill, dirConsultants ) {
    $scope.skills = dirSkills.query();
    $scope.skillToApprove = dirApproveSkill.get({ id: $routeParams.id });
    $scope.currentUser = dirIdentity.currentUser;
    $scope.skillToApprove.currentUser = $scope.currentUser;

    function formattedName(x) {
        return x.id + ' ' + x.name;
    };

    $http.get('/api/skillLevels')
        .success(function (data) {
            $scope.skillLevels = data.map(formattedName);
            $scope.skillLevel = $scope.skillToApprove.level;
        })
        .error(function () {
            $scope.skillLevels = [];
        });

    function setSkillLevel () {
        $scope.skillLevel = $scope.skillToApprove.level;
    }
    setSkillLevel ();
});