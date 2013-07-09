'use strict';

describe('Service: rules', function () {

  // load the service's module
  beforeEach(module('bmlayersApp'));

  // instantiate service
  var rules;
  beforeEach(inject(function (_rules_) {
    rules = _rules_;
  }));

  it('should do something', function () {
    expect(!!rules).toBe(true);
  });

});
