'use strict';

describe('Service: layers', function () {

  // load the service's module
  beforeEach(module('bmlayersApp'));

  // instantiate service
  var layers;
  beforeEach(inject(function (_layers_) {
    layers = _layers_;
  }));

  it('should do something', function () {
    expect(!!layers).toBe(true);
  });

});
