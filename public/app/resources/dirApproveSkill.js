angular.module( 'app' ).factory( 'dirApproveSkill', function ( $resource ) {
    var approveSkillResource = $resource( '/api/approveSkill/:id', { id: "@name" }, {
        get: {
            method: 'GET',
            transformResponse: function(data) {
                var value = angular.fromJson(data);

                return {name: 'Landry Skill', description: 'Landry Skill Description', level: '6 Expert'};
            }
        }
    });

    return approveSkillResource;
});
