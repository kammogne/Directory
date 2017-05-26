angular.module( 'app' ).factory( 'dirRequestSkill', function ( $resource ) {
    var SkillRequestResource = $resource( '/api/requestskill/:id', { id: "@name" });

    return SkillRequestResource;
});
