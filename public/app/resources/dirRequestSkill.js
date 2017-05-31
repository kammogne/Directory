angular.module( 'app' ).factory( 'dirRequestSkill', function ( $resource ) {
    var RequestSkillResource = $resource( '/api/requestSkill/:id', { id: "@name" });

    return RequestSkillResource;
});
