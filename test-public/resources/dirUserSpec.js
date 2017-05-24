describe('dirUser', function () {
  beforeEach(module('app'));

  it('should exist', inject(function (dirUser) {
    expect(dirUser).to.exist;
  }));
});
