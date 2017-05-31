angular.module( 'app' ).controller( 'dirRequestSkillCntrl', function ( $scope, $http, dirNotifier, dirIdentity, dirRequestSkill ) {

    $scope.skills = dirRequestSkill.query();
    $scope.skillRequested = new dirRequestSkill();
    $scope.currentUser = dirIdentity.currentUser;

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

    $scope.save = function () {
       //TODO: Landry implement the send request including sending email address to the managers for approval.
        $scope.skillRequested.$save(function () {
            dirNotifier.notify( 'Skill has successfully been requested.');
            $scope.skills = dirRequestSkill.query();
            $scope.skillRequested = new dirRequestSkill();
        }, function () {
            dirNotifier.error( 'There was an error, try again later.' );
        });
    };
});