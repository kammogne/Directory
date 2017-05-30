angular.module( 'app' ).factory( 'dirRequestSkill', function ( $resource ) {
    var SkillRequestResource = $resource( '/api/requestskill/:id', { id: "@name" });

    SkillRequestResource.prototype._resourceSave = SkillRequestResource.prototype.$save;
    SkillRequestResource.prototype.$save = function (success, error) {
        this._resourceSave(function (requestSkill) {
           success();
        }, error);
    };

    return SkillRequestResource;
});
