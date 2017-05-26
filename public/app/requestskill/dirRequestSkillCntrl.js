angular.module( 'app' ).controller( 'dirRequestSkillCntrl', function ( $scope, $http, dirSkills, dirNotifier ) {

    $scope.skills = dirSkills.query();
    $scope.newSkill = new dirSkills();

    function formattedName(x) {
        return x.id + ' ' + x.name;
    };
    $http.get('/api/skillLevels')
        .success(function (data) {
            $scope.skillLevels = data.map(formattedName);
        })
        .error(function () {
            $scope.skillLevels = [];
    });

    $scope.sendRequest = function () {
       //TODO: Landry implement the send request including sending email address to the managers for approval.
    };
});