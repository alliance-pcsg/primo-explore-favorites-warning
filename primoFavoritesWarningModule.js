(function(){
"use strict";
'use strict';

/*
 * load custom view
 */
let app = angular.module('viewCustom', ['angularLoad']);

/*RootScope is needed for updating all favorites warning overlay elements in the DOM without reloading the page after the 
	warning is dismissed*/
app.run(["$rootScope", function($rootScope) {
	$rootScope.view = false;
}]);

/*Global variables for quick custom edits*/
app.value('globalFavVars', {
	favWarnBarTxt: 'Sign in to make your favorites list permanent',
	favWarnModalTitleText: 'Sign in to make your favorites list permanent',
	favWarnModalHoverText: 'Add to my favorites',
	favWarnModalContentText: 'You can create a favorites list as a Guest, but to save a list permanently you must be signed in.',
	enableFavWarningBar: 'true', //set to 'false' to keep the warning bar on the favorites page from showing
	enableFavModal: 'true' //set to 'false' to keep the overlay in the results list from being used (turns of modal pop-up)
});

//Controller for warning bar on my favorites page
app.controller('prmFavoritesToolBarAfterCtrl', function($scope, $rootScope, favSession, globalFavVars) {
	$scope.favWarning = favSession.getData();
	if($scope.favWarning === null){
		favSession.setData(globalFavVars.enableFavWarningBar);
		$scope.favWarning = favSession.getData();
	};
	$scope.favWarningOnClick = function(){
		favSession.setData('false');
		$scope.favWarning = favSession.getData();
		$rootScope.view = false;
	};
	let rootScope = $scope.$root;
  	let uSMS=rootScope.$$childHead.$ctrl.userSessionManagerService;
  	let jwtData = uSMS.jwtUtilService.getDecodedToken();
	if(jwtData.userGroup === "GUEST"){
		$scope.isLoggedIn = 'false';
	}
	else {
		$scope.isLoggedIn = 'true';
	}
	
	if($scope.favWarning == 'true' && $scope.isLoggedIn == 'false'){
		$rootScope.view = true;
	}
	$scope.favWarningBarText = globalFavVars.favWarnBarTxt;
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
	
//Favorites warning bar component
app.component('prmFavoritesToolBarAfter', {
	bindings: {},
	controller: 'prmFavoritesToolBarAfterCtrl',
	template:  '<div ng-controller="prmFavoritesToolBarAfterCtrl" id="fav-bar" ng-show="$root.view" class="bar alert-bar">'+
					'<p style="text-align: center; padding:.4em">'+
					'<span id="fav-bar-text" ng-bind-html="favWarningBarText"></span>'+ 
					'<prm-authentication [is-logged-in]="$ctrl.userName().length > 0">'+
						'<button class="button-with-icon zero-margin md-button md-primoExplore-theme md-ink-ripple" type="button" ng-transclude="">'+
							'<prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="sign-in">'+
								'<md-icon md-svg-icon="primo-ui:sign-in" alt="" class="md-primoExplore-theme" aria-hidden="true"></md-icon>'+
							'</prm-icon>'+
							'<span translate="eshelf.signin.title">Sign in</span>'+
						'</button>'+
					'</prm-authentication>'+
					'<button class="dismiss-alert-button zero-margin md-button md-primoExplore-theme md-ink-ripple button-with-icon" ng-click="favWarningOnClick()">'+
						'<prm-icon icon-type="svg" svg-icon-set="navigation" icon-definition="ic_close_24px">'+
							'<md-icon md-svg-icon="navigation:ic_close_24px" alt="" class="md-primoExplore-theme" aria-hidden="true"></md-icon>'+
						'</prm-icon>'+
						'DISMISS'+
					'</button>'+
					'</p>'+
				'</div>'
});

//Controller for Favorites Warning popup modal
app.controller('prmSaveToFavoritesButtonAfterCtrl', function($scope, $mdDialog, $rootScope, favSession, globalFavVars) {
	$scope.status = ' ';
	$scope.customFullscreen = false;
	$scope.favWarning = favSession.getData();
		if($scope.favWarning === null){
			favSession.setData(globalFavVars.enableFavModal);
			$scope.favWarning = favSession.getData();
		};
		
		let rootScope = $scope.$root;
	  	let uSMS=rootScope.$$childHead.$ctrl.userSessionManagerService;
	  	let jwtData = uSMS.jwtUtilService.getDecodedToken();
		if(jwtData.userGroup === "GUEST"){
			$scope.isLoggedIn = 'false';
		}
		else {
			$scope.isLoggedIn = 'true';
		}
		
		if($scope.favWarning == 'true' && $scope.isLoggedIn == 'false'){
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
app.component('prmSaveToFavoritesButtonAfter', {
	controller: 'prmSaveToFavoritesButtonAfterCtrl',
	template:'<div>'+
				'<md-tooltip md-delay="400"><p ng-bind-html="favWarnModalHoverDisplay"></p></md-tooltip>'+
				'<button class="md-icon-button custom-button pin-button md-button md-primoExplore-theme md-ink-ripple pinned" style="margin-top: -40px; position: absolute; cursor: pointer"  ng-disabled="$ctrl.isFavoritesDisabled()" ng-show="$root.view" ng-click="showFavWarningModal($event); favWarningOnClick()">'+
					'<prm-icon class="rotate-25" icon-type="svg" svg-icon-set="primo-ui" icon-definition="prm_pin">'+
						'<md-icon md-svg-icon="primo-ui:prm_pin" alt="" class="md-primoExplore-theme" aria-hidden="true">'+
							'<svg id="prm_pin" width="100%" height="100%" viewBox="0 0 24 24" y="0" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">'+
								'<path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"></path>'+
							'</svg>'+
						'</md-icon>'+
					'</prm-icon>'+
				'</button>'+
			'</div>'
});

})();