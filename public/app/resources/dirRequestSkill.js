angular.module( 'app' ).factory( 'dirRequestSkill', function ( $resource ) {
    var requestSkillResource = $resource( '/api/requestSkill/:id', { id: "@name" });

    return requestSkillResource;
});
