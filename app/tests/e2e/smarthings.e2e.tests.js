'use strict';

describe('Smarthings E2E Tests:', function () {
  describe('Test Smarthings page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/smarthings');
      expect(element.all(by.repeater('smarthing in smarthings')).count()).toEqual(0);
    });
  });
});
