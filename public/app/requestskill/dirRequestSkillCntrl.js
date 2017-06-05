angular.module( 'app' ).controller( 'dirRequestSkillCntrl', function ( $scope, $http, dirNotifier, dirIdentity, dirRequestSkill, dirConsultants ) {

    $scope.skills = dirRequestSkill.query();
    $scope.skillRequested = new dirRequestSkill();
    $scope.currentUser = dirIdentity.currentUser;
    $scope.consultant = dirConsultants.get({ id: $scope.currentUser.emailNickname });
    $scope.skillRequested.consultant = $scope.consultant;

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
        $scope.skillRequested.$save(function () {
            dirNotifier.notify( 'skill has successfully been requested.');
            addSkillToConsultant();
            $scope.skills = dirRequestSkill.query();
            $scope.skillRequested = new dirRequestSkill();
            $scope.skillLevel = '0 None';
        }, function () {
            dirNotifier.error( 'There was an error, try again later.' );
        });
    };

    var addSkillToConsultant = function(){
        var canAdd = $scope.skillRequested.isSkillApplyToRequester,
            skill = $scope.skillRequested;
        ;


       $scope.consultant.skills.some( function(element){
            if(element.name === skill.name){
                canAdd = false;
                console.log("Skill " + skill.name + " exists: ");
                return true;
            }
        });

       if(canAdd){
            console.log("pushing skill: '" + skill.name + "'");
            $scope.consultant.skills.push(skill);
            $scope.consultant.$save(function () {
               dirNotifier.notify( 'Skill has been saved successfully.');
            }, function () {
               dirNotifier.error( 'There was an error, try again later.' );
            });
       }

    };
});