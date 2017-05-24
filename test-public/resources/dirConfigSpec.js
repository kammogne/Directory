describe('dirConfig', function () {
  beforeEach(module('app'));

  it('should exist', inject(function (dirConfig) {
    expect(dirConfig).to.exist;
  }));
  
  describe('call getConfig', function() {
    
    it('should have a managerRoles property', inject(function (dirConfig){
      var config = dirConfig.getConfig();
      config.$promise.then(function(){
        expect(config).has.property('managerRoles');
      });
    }));
  });
});
