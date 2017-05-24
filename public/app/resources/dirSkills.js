angular.module( 'app' ).factory( 'dirSkills', function ( $resource ) {
  var SkillsResource = $resource( '/api/skills/:id', { id: "@name" });

  return SkillsResource;
});
