'use strict';

angular.module('webSiteApp')
.directive( 'matchValidator', function() {
  return {
    require : 'ngModel',
    link : function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        ngModel.$setValidity('match', value == scope.$eval(attrs.matchValidator));
        return value;
      });
    }
  }
})
.directive('udRequired', function() {
  return {
    require : 'ngModel',
    link : function(scope, element, attrs, ngModel) {
      ngModel.$validators.required = function(modelValue, viewValue) {
        return modelValue !== undefined && modelValue !== null && modelValue && modelValue.length > 0;
      };
    }
  };
})
.directive('ngEnter', function() {//http://eric.sau.pe/angularjs-detect-enter-key-ngenter/
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if (event.which === 13) {
        scope.$apply(function() {
          scope.$eval(attrs.ngEnter);
        });

        event.preventDefault();
      }
    });
  };
});
