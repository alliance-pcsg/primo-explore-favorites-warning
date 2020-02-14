//Favorites Warning module
angular
.module('showFavoritesWarning', [])
.run(["$rootScope", function ($rootScope) {
    $rootScope.view = false;
}])
.value('globalFavVars', {
    favWarnBarTxt: 'Sign in to make your favorites list permanent',
    favWarnModalTitleText: 'Sign in to make your favorites list permanent',
    favWarnModalContentText: 'You can create a favorites list as a Guest, but to save a list permanently you must be signed in.',
})
.factory("favSession", function ($window, $rootScope) {
    angular.element($window).on('storage', function (event) {
        if (event.key === 'showFavWarning') {
            $rootScope.$apply();
        }
    });
    /*Functions for setting and getting session data*/
    return {
        setData: function (val) {
            $window.sessionStorage && $window.sessionStorage.setItem('showFavWarning', val);
            return this;
        },
        getData: function () {
            return $window.sessionStorage && $window.sessionStorage.getItem('showFavWarning');
        }
    };
})
.controller('favOverlayCtrl', function ($scope, $mdDialog, $rootScope, favSession, globalFavVars) {
    $scope.status = ' ';
    $scope.customFullscreen = false;
    $scope.favWarning = favSession.getData();  //Pull session data to determine if favorites warning modal should be displayed
    var icon_definition = $scope.$parent.$parent.$ctrl.iconDefinition;
    this.isPinIcon = false;
    if(icon_definition === 'prm_pin')
    {
      this.isPinIcon = true;
    }

    /*Upon initialization of the app the favSession value will be null, so we need to give it a value
	based on global variables set by the institution in their custom.js file*/
    if ($scope.favWarning === null) {
        favSession.setData('true');
        $scope.favWarning = favSession.getData();
    }
    /*If the user is a guest then the isLoggedIn variable is set to 'false'*/
    let rootScope = $scope.$root;
    let uSMS = rootScope.$$childHead.$ctrl.userSessionManagerService;
    let jwtData = uSMS.jwtUtilService.getDecodedToken();
    if (jwtData.userGroup === "GUEST") {
        $scope.isLoggedIn = 'false';
    }
    else {
        $scope.isLoggedIn = 'true';
    }
    /*Set the rootScope view variable depending on session data, if the user is logged in*/
    if ($scope.favWarning === 'true' && $scope.isLoggedIn === 'false') {
        $rootScope.view = true;
    }

    $scope.favWarningOnClick = function () {
        favSession.setData('false');
        $scope.favWarning = favSession.getData();
        $rootScope.view = false;
    };
    /*Function to display favorites warning modal when favorites icon is clicked*/
    $scope.showFavWarningModal = function (ev) {
        $mdDialog.show({
            template: '<md-dialog>' +
                           '<md-dialog-content>' +
                               '<md-toolbar id="fav-modal-header">' +
                                   '<div class="md-toolbar-tools">' +
                                       '<h2 class="flex"><p id="fav-modal-header-text" ng-bind-html="favWarnModalTitleDisplay"></p></h2>' +
                                   '</div>' +
                               '</md-toolbar>' +
                               '<div id="fav-modal-content" class="md-dialog-content">' +
                                   '<p id="fav-modal-content-text" ng-bind-html="favWarnModalContentDisplay"></p>' +
                                   '<p style="text-align: center">' +
                                       '<prm-authentication>' +
                                           '<button class="button-with-icon zero-margin md-button md-primoExplore-theme md-ink-ripple" type="button" ng-transclude="">' +
                                               '<prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="sign-in">' +
                                                   '<md-icon md-svg-icon="primo-ui:sign-in" alt="" class="md-primoExplore-theme" aria-hidden="true"></md-icon>' +
                                               '</prm-icon>' +
                                               '<span translate="eshelf.signin.title">Sign in</span>' +
                                           '</button>' +
                                       '</prm-authentication>' +
                                       '<button class="dismiss-alert-button zero-margin md-button md-primoExplore-theme md-ink-ripple button-with-icon" ng-click="favModalClose(); favWarningOnClick()">' +
                                           '<prm-icon icon-type="svg" svg-icon-set="navigation" icon-definition="ic_close_24px">' +
                                               '<md-icon md-svg-icon="navigation:ic_close_24px" alt="" class="md-primoExplore-theme" aria-hidden="true"></md-icon>' +
                                           '</prm-icon>' +
                                           'DISMISS' +
                                       '</button></p>' +
                               '</div>' +
                           '</md-dialog-content>' +
                       '</md-dialog>',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen,
            controller: function favModalDialogCtrl($scope, $mdDialog, $state, favSession, globalFavVars) {
                $scope.favModalClose = function () {
                    $mdDialog.hide();
                }
                $scope.favWarnModalTitleDisplay = globalFavVars.favWarnModalTitleText;
                $scope.favWarnModalContentDisplay = globalFavVars.favWarnModalContentText;
            }
        })
    };
})
.component('favOverlay', {  //This component is an element that sits over the favorites icon when the modal warning functionality is enabled.
    controller: 'favOverlayCtrl',
    template: '<div>' +
				'<button style="cursor: pointer; background: transparent; border: none; width: 41px; height: 41px; margin: -31px 0px 0px -21px; position: absolute" ng-if="$ctrl.isPinIcon" ng-disabled="$ctrl.isFavoritesDisabled()" ng-show="$root.view" ng-click="showFavWarningModal($event); favWarningOnClick()">' +
        '</button>' +
			'</div>'
});

// End Favorites signin warning
