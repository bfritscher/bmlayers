'use strict';

describe('Directive: curve', function () {
  beforeEach(module('bmlayersApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<curve></curve>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the curve directive');
  }));
});
