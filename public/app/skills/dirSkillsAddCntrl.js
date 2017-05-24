angular.module( 'app' ).controller( 'dirSkillsAddCntrl', function ( $scope, dirSkills, dirNotifier ) {

  $scope.skills = dirSkills.query();
  $scope.newSkill = new dirSkills();
  
  $scope.save = function () {
    $scope.newSkill.$save(function () {
      dirNotifier.notify( 'Skill has been saved successfully.');
      $scope.skills = dirSkills.query();
      $scope.newSkill = new dirSkills();
    }, function () {
      dirNotifier.error( 'There was an error, try again later.' );
    });
  };

  $scope.delete = function( skill ) {
    console.log(skill);
    skill.$delete( function () {
      dirNotifier.notify( 'Skill has been removed successfully.');      
    }, function () {
      dirNotifier.error( 'There was an error, try again later.' );
    });
    $scope.skills = dirSkills.query();
  };

});