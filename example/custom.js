(function(){
"use strict";
'use strict';

/*
 * load custom view
 */
let app = angular.module('viewCustom', ['angularLoad', 'showFavoritesWarning']);

/*RootScope is needed for updating all favorites warning overlay elements in the DOM without reloading the page after the 
	warning is dismissed*/
app.run(["$rootScope", function($rootScope) {
	$rootScope.view = false;
}]);

/*Global variables for quick custom edits*/
app.value('globalFavVars', {
	favWarnBarTxt: 'Sign in to make your favorites list permanent',
	favWarnModalTitleText: 'Sign in to make your favorites list permanent',
	favWarnModalContentText: 'You can create a favorites list as a Guest, but to save a list permanently you must be signed in.',
});


//Production Factory that stores session data so that once the warning is dismissed it doesn't come back until a new tab or window is opened
app.factory("favSession", function($window, $rootScope) {
	angular.element($window).on('storage', function(event) {
		if (event.key === 'showFavWarning') {
		  $rootScope.$apply();
		}
	});
	    return {
			setData: function(val) {
				$window.sessionStorage && $window.sessionStorage.setItem('showFavWarning', val);
				return this;
			},
			getData: function() {
				return $window.sessionStorage && $window.sessionStorage.getItem('showFavWarning');
			}
		};
});
	


//Controller for Favorites Warning popup modal
app.controller('favOverlayCtrl', function($scope, $mdDialog, $rootScope, favSession, globalFavVars) {
	$scope.status = ' ';
	$scope.customFullscreen = false;
	$scope.favWarning = favSession.getData();
	var icon_definition = $scope.$parent.$parent.$ctrl.iconDefinition;
    	this.isPinIcon = false;
    	if(icon_definition === 'prm_pin')
    	{
      	this.isPinIcon = true;
    	}
	if($scope.favWarning === null){
		if(globalFavVars.enableFavWarningBar === 'false' && globalFavVars.enableFavModal === 'false'){
			favSession.setData('false');
			$scope.favWarning = favSession.getData();
		}
		else {
			favSession.setData('true');
			$scope.favWarning = favSession.getData();
		}
	}
		
	let rootScope = $scope.$root;
	let uSMS=rootScope.$$childHead.$ctrl.userSessionManagerService;
	let jwtData = uSMS.jwtUtilService.getDecodedToken();
	if(jwtData.userGroup === "GUEST"){
		$scope.isLoggedIn = 'false';
	}
	else {
		$scope.isLoggedIn = 'true';
	}
		
	if($scope.favWarning === 'true' && $scope.isLoggedIn === 'false' && globalFavVars.enableFavModal === 'true'){
		$rootScope.view = true;
	}
	
	$scope.favWarnModalHoverDisplay = globalFavVars.favWarnModalHoverText;
	
	$scope.favWarningOnClick = function(){
			favSession.setData('false');
			$scope.favWarning = favSession.getData();
			$rootScope.view = false;
		};	
	
	$scope.showFavWarningModal = function(ev) {
    $mdDialog.show({
     template: '<md-dialog>'+
					'<md-dialog-content>'+
						'<md-toolbar id="fav-modal-header">'+
							'<div class="md-toolbar-tools">'+
								'<h2 class="flex"><p id="fav-modal-header-text" ng-bind-html="favWarnModalTitleDisplay"></p></h2>'+
							'</div>'+
						'</md-toolbar>'+
						'<div id="fav-modal-content" class="md-dialog-content">'+
							'<p id="fav-modal-content-text" ng-bind-html="favWarnModalContentDisplay"></p>'+
							'<p style="text-align: center">'+
								'<prm-authentication>'+
									'<button class="button-with-icon zero-margin md-button md-primoExplore-theme md-ink-ripple" type="button" ng-transclude="">'+
										'<prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="sign-in">'+
											'<md-icon md-svg-icon="primo-ui:sign-in" alt="" class="md-primoExplore-theme" aria-hidden="true"></md-icon>'+
										'</prm-icon>'+
										'<span translate="eshelf.signin.title">Sign in</span>'+
									'</button>'+
								'</prm-authentication>'+
								'<button class="dismiss-alert-button zero-margin md-button md-primoExplore-theme md-ink-ripple button-with-icon" ng-click="favModalClose(); favWarningOnClick()">'+
									'<prm-icon icon-type="svg" svg-icon-set="navigation" icon-definition="ic_close_24px">'+
										'<md-icon md-svg-icon="navigation:ic_close_24px" alt="" class="md-primoExplore-theme" aria-hidden="true"></md-icon>'+
									'</prm-icon>'+
									'DISMISS'+
								'</button></p>'+
						'</div>'+
					'</md-dialog-content>'+
				'</md-dialog>',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: $scope.customFullscreen,
	  controller: favModalDialogCtrl
    })
  };
});

//Controller for closing the fav warning modal pop-up window
function favModalDialogCtrl($scope, $mdDialog, $state, favSession, globalFavVars){
	$scope.favModalClose = function(){
		$mdDialog.hide();	
	}
	$scope.favWarnModalTitleDisplay = globalFavVars.favWarnModalTitleText;
	$scope.favWarnModalContentDisplay = globalFavVars.favWarnModalContentText ;
}
//Overlay for save to favorites button and Fav warning component for tooltip on hover
app.component('favOverlay', {
	controller: 'favOverlayCtrl',
	template: '<div>' +
	'<button style="cursor: pointer; background: transparent; border: none; width: 41px; height: 41px; margin: -31px 0px 0px -21px; position: absolute" ng-if="$ctrl.isPinIcon" ng-disabled="$ctrl.isFavoritesDisabled()" ng-show="$root.view" ng-click="showFavWarningModal($event); favWarningOnClick()">' +
        '</button>' +
'</div>'

})();
