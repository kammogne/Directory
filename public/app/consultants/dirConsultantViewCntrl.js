angular.module( 'app' ).controller( 'dirConsultantViewCntrl', function ( $scope, $routeParams, dirConsultants, dirIdentity, dirNotifier, dirSkills, dirVerticals) {

  $scope.consultant = dirConsultants.get({ id: $routeParams.id });
  $scope.tab = 'tab-ad';
  $scope.user = dirIdentity.currentUser;
  $scope.skills = dirSkills.query();
  $scope.verticals = dirVerticals.query();

  // functions
  $scope.isEditor = function () {
    if ( !!dirIdentity.currentUser && !!$scope.consultant) {
      return dirIdentity.currentUser.adId === $scope.consultant.adId ||
          dirIdentity.isManager();
    }
    return false;
  };

  var selectedCvtIndex = -1;

  $scope.selectCvt = function (cvt) {
    if ($scope.consultant.careerValuationTools) {
      selectedCvtIndex = $scope.consultant.careerValuationTools.indexOf(cvt);
    }
  };

  $scope.selectedCvt = function () {
    if ($scope.consultant
        && $scope.consultant.careerValuationTools
        && selectedCvtIndex >= 0)
      return $scope.consultant.careerValuationTools[selectedCvtIndex];
    else
      return null;
  };

  $scope.addCvt = function () {
    var newCvt = $scope.consultant.addCvt();
    $scope.selectCvt(newCvt);
  };

  $scope.save = function () {
    console.log($scope.consultant);
    $scope.consultant.$save(function () {
      dirNotifier.notify( 'Profile has been saved successfully.');
    }, function () {
      dirNotifier.error( 'There was an error, try again later.' );
    });
  };

  $scope.updateSkill = function(skill, $event){
    var ckBox = document.getElementById(skill.name),
        shouldAdd = !ckBox["checked"],
        foundIndex = -1,
        canAdd = true,
        canRemove = false;

    $scope.consultant.skills.some( function(element, index){
        if(element._id === skill._id){
          foundIndex = index;
          canAdd = false;
          canRemove = true;
          console.log("foundIndex: " + foundIndex);
          return true;
        }
    });

    if( shouldAdd){
      if(canAdd){
        console.log("pushing skill: '" + skill.name + "'");
        $scope.consultant.skills.push(skill);
      }
    } else if( canRemove ){
      $scope.consultant.skills.splice( foundIndex, 1 );
      console.log("splice skill: ' " + skill.name + "'");
    }
  };

  $scope.updateVertical = function(vertical, $event){
    var ckBox = document.getElementById(vertical.name),
        shouldAdd = !ckBox["checked"],
        foundIndex = -1,
        canAdd = true,
        canRemove = false;

    $scope.consultant.verticals.some( function(element, index){
        if(element._id === vertical._id){
          foundIndex = index;
          canAdd = false;
          canRemove = true;
          console.log("foundIndex: " + foundIndex);
          return true;
        }
    });

    if( shouldAdd){
      if(canAdd){
        console.log("pushing vertical: '" + vertical.name + "'");
        $scope.consultant.verticals.push(vertical);
      }
    } else if( canRemove ){
      $scope.consultant.verticals.splice( foundIndex, 1 );
      console.log("splice vertical: '" + vertical.name + "'");
    }
  };

  $scope.highlight =function(skillId){
    var isit = $scope.skillChecked(skillId);
    return isit === "checked";
  };

  $scope.highlightVertical =function(verticalId){
    var isit = $scope.verticalChecked(verticalId);
    return isit === "checked";
  };

  $scope.skillChecked = function(skillId) {

    // Inserted by Tim
    // Have to check for null consultant, as REST call might not have
    // populated the form yet.  So guard it as follows:
    if ( !$scope.consultant ) { return false; }

    var checked = "";
    $scope.consultant.skills.some( function(element){
        if(element._id === skillId){
          checked = "checked";
          return true; // break out of the loop
        }
    });
    return checked;
  };

  $scope.verticalChecked = function(verticalId) {

    // Inserted by Tim
    // Have to check for null consultant, as REST call might not have
    // populated the form yet.  So guard it as follows:
    if ( !$scope.consultant ) { return false; }

    var checked = "";
    $scope.consultant.verticals.some( function(element){
        if(element._id === verticalId){
          checked = "checked";
          return true; // break out of the loop
        }
    });
    return checked;
  };

});

angular.module( 'app' ).filter('stringSort', function() {
    return function(input) {
      if (typeof input === "undefined") {
        return input;
      }

      return input.sort(function(a, b) {
        if (a.toLowerCase() < b.toLowerCase()) return -1;
        if (a.toLowerCase() > b.toLowerCase()) return 1;
        return 0;
      });
    };
  });

angular.module( 'app' ).filter( 'skillSearch', function () {
  return function ( items, search ) {
    var cleanSearch = ( search || '' ).toLowerCase();
    var filtered = items.filter(function ( i ) {
      return ( i.name && i.name.toLowerCase().indexOf( cleanSearch ) > -1 );
    });
    return filtered;
  };
});

angular.module( 'app' ).filter( 'verticalSearch', function () {
  return function ( items, search ) {
    var cleanSearch = ( search || '' ).toLowerCase();
    var filtered = items.filter(function ( i ) {
      return ( i.name && i.name.toLowerCase().indexOf( cleanSearch ) > -1 );
    });
    return filtered;
  };
});
