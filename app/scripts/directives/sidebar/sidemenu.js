// see ui.bootstrap.accordion
angular.module('sidemenu', ["template/sidemenu/sidemenu.html","template/sidemenu/sidemenu-group.html","template/sidemenu/sidemenu-group-leaf.html"])

.constant('sidemenuConfig', {
  closeOthers: true
})

.controller('SidemenuController', ['$scope', '$attrs', 'sidemenuConfig', function ($scope, $attrs, sidemenuConfig) {

  // This array keeps track of the sidemenu groups
  this.groups = [];

  // Ensure that all the groups in this sidemenu are closed, unless close-others explicitly says not to
  this.closeOthers = function(openGroup) {
    var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : sidemenuConfig.closeOthers;
    if ( closeOthers ) {
      angular.forEach(this.groups, function (group) {
        if ( group !== openGroup ) {
          group.isOpen = false;
        }
      });
    }
  };

  // This is called from the sidemenu-group directive to add itself to the sidemenu
  this.addGroup = function(groupScope) {
    var that = this;
    this.groups.push(groupScope);

    groupScope.$on('$destroy', function (event) {
      that.removeGroup(groupScope);
    });
  };

  // This is called from the sidemenu-group directive when to remove itself
  this.removeGroup = function(group) {
    var index = this.groups.indexOf(group);
    if ( index !== -1 ) {
      this.groups.splice(index, 1);
    }
  };

}])

// The sidemenu directive simply sets up the directive controller
// and adds an sidemenu CSS class to itself element.
.directive('sidemenu', function () {
  return {
    restrict:'EA',
    controller:'SidemenuController',
    transclude: true,
    replace: false,
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'template/sidemenu/sidemenu.html';
    }
  };
})

// The sidemenu-group directive indicates a block of html that will expand and collapse in an sidemenu
.directive('sidemenuGroup', function() {
  return {
    require:'^sidemenu',         // We need this directive to be inside an sidemenu
    restrict:'EA',
    transclude:true,              // It transcludes the contents of the directive into the template
    replace: true,                // The element containing the directive will be replaced with the template
    templateUrl: function(element, attrs) {
      if (attrs.node) {//if it is not a leaf node
        return attrs.templateUrl || 'template/sidemenu/sidemenu-group.html';
      } else {
        return attrs.templateUrl || 'template/sidemenu/sidemenu-group-leaf.html';
      }
    },
    scope: {
      heading: '@',               // Interpolate the heading attribute onto this scope
      icon: '@',
      isOpen: '=?',
      isDisabled: '=?'
    },
    controller: function() {
      this.setHeading = function(element) {
        this.heading = element;
      };
    },
    link: function(scope, element, attrs, sidemenuCtrl) {
      sidemenuCtrl.addGroup(scope);

      scope.$watch('isOpen', function(value) {
        if ( value ) {
          sidemenuCtrl.closeOthers(scope);
        }
      });

      scope.toggleOpen = function() {
        if ( !scope.isDisabled ) {
          scope.isOpen = !scope.isOpen;
        }
      };
    }
  };
})

// Use sidemenu-heading below an sidemenu-group to provide a heading containing HTML
// <sidemenu-group>
//   <sidemenu-heading>Heading containing HTML - <img src="..."></sidemenu-heading>
// </sidemenu-group>
.directive('sidemenuHeading', function() {
  return {
    restrict: 'EA',
    transclude: true,   // Grab the contents to be used as the heading
    template: '',       // In effect remove this element!
    replace: true,
    require: '^sidemenuGroup',
    link: function(scope, element, attr, sidemenuGroupCtrl, transclude) {
      // Pass the heading to the sidemenu-group controller
      // so that it can be transcluded into the right place in the template
      // [The second parameter to transclude causes the elements to be cloned so that they work in ng-repeat]
      sidemenuGroupCtrl.setHeading(transclude(scope, angular.noop));
    }
  };
})

// Use in the sidemenu-group template to indicate where you want the heading to be transcluded
// You must provide the property on the sidemenu-group controller that will hold the transcluded element
// <div class="sidemenu-group">
//   <div class="sidemenu-heading" ><a ... sidemenu-transclude="heading">...</a></div>
//   ...
// </div>
.directive('sidemenuTransclude', function() {
  return {
    require: '^sidemenuGroup',
    link: function(scope, element, attr, controller) {
      scope.$watch(function() { return controller[attr.sidemenuTransclude]; }, function(heading) {
        if ( heading ) {
          element.find('span').html('');
          element.find('span').append(heading);
        }
      });
    }
  };
})

;
angular.module("template/sidemenu/sidemenu-group.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/sidemenu/sidemenu-group.html",
    "<li>\n" +
    "  <a href ng-click=\"toggleOpen()\" sidemenu-transclude=\"heading\"><i class=\"fa fa-{{icon?icon:'circle-o'}} fa-fw\"></i><span> {{heading}}</span><span class=\"fa arrow\"></span></a>\n" +
    "  <ul class=\"nav nav-indent collapse\" collapse=\"!isOpen\" ng-transclude>\n" +
    "  </ul>\n" +
    "</li>\n" +
    "");
}]);
angular.module("template/sidemenu/sidemenu-group-leaf.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/sidemenu/sidemenu-group-leaf.html",
    "<li>\n" +
    "  <a href ng-click=\"toggleOpen()\" sidemenu-transclude=\"heading\"><i class=\"fa fa-{{icon?icon:'circle-o'}} fa-fw\"></i><span> {{heading}}</span></a>\n" +
    "</li>\n" +
    "");
}]);
angular.module("template/sidemenu/sidemenu.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/sidemenu/sidemenu.html",
    "<ul class=\"nav in\" ng-transclude></ul>");
}]);
