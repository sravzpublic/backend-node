(function () {
  'use strict';

  describe('Smarthings Route Tests', function () {
    // Initialize global variables
    var $scope,
      SmarthingsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _SmarthingsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      SmarthingsService = _SmarthingsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('smarthings');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/smarthings');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          SmarthingsController,
          mockSmarthing;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('smarthings.view');
          $templateCache.put('modules/smarthings/client/views/view-smarthing.client.view.html', '');

          // create mock Smarthing
          mockSmarthing = new SmarthingsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Smarthing Name'
          });

          // Initialize Controller
          SmarthingsController = $controller('SmarthingsController as vm', {
            $scope: $scope,
            smarthingResolve: mockSmarthing
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:smarthingId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.smarthingResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            smarthingId: 1
          })).toEqual('/smarthings/1');
        }));

        it('should attach an Smarthing to the controller scope', function () {
          expect($scope.vm.smarthing._id).toBe(mockSmarthing._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/smarthings/client/views/view-smarthing.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          SmarthingsController,
          mockSmarthing;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('smarthings.create');
          $templateCache.put('modules/smarthings/client/views/form-smarthing.client.view.html', '');

          // create mock Smarthing
          mockSmarthing = new SmarthingsService();

          // Initialize Controller
          SmarthingsController = $controller('SmarthingsController as vm', {
            $scope: $scope,
            smarthingResolve: mockSmarthing
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.smarthingResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/smarthings/create');
        }));

        it('should attach an Smarthing to the controller scope', function () {
          expect($scope.vm.smarthing._id).toBe(mockSmarthing._id);
          expect($scope.vm.smarthing._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/smarthings/client/views/form-smarthing.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          SmarthingsController,
          mockSmarthing;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('smarthings.edit');
          $templateCache.put('modules/smarthings/client/views/form-smarthing.client.view.html', '');

          // create mock Smarthing
          mockSmarthing = new SmarthingsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Smarthing Name'
          });

          // Initialize Controller
          SmarthingsController = $controller('SmarthingsController as vm', {
            $scope: $scope,
            smarthingResolve: mockSmarthing
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:smarthingId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.smarthingResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            smarthingId: 1
          })).toEqual('/smarthings/1/edit');
        }));

        it('should attach an Smarthing to the controller scope', function () {
          expect($scope.vm.smarthing._id).toBe(mockSmarthing._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/smarthings/client/views/form-smarthing.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
