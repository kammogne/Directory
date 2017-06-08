angular.module( 'app' ).factory( 'dirApproveSkill', function ( $resource ) {
    var approveSkillResource = $resource( '/api/approveSkill/:id', { id: "@name" });

    return approveSkillResource;
});
