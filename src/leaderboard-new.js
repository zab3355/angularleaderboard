//firebase conneciton
var app = angular.module('leaderboard', ['firebase']);

app.constant('FIREBASE_URI', 'https://ng-fb-leaderboard.firebaseio.com/');

app.controller('MainCtrl', function (TeamsService) {
    var main = this;
    main.newTeam = {logo: '', name: ''};
    main.currentTeam = null;
    main.teams = TeamsService.getTeams();

    main.addTeam = function () {
        TeamsService.addTeam(angular.copy(main.newTeam));
        main.newTeam = {logo: '', name: ''};

    };

    main.updateTeam = function (team) {
        TeamsService.updateTeam(team);
    };

    main.removeTeam = function (team) {
        TeamsService.removeTeam(team);
    };

    main.incrementScore = function () {
        main.currentTeam.score = parseInt(main.currentTeam.score, 10) + 1;
        main.updateTeam(main.currentTeam);
    };

    main.decrementScore = function () {
        main.currentTeam.score = parseInt(main.currentTeam.score, 10) - 1;
        main.updateTeam(main.currentTeam);
    };
});

 app.service('TeamsService', function ($firebaseArray, FIREBASE_URI) {
    var service = this;
    var ref = new Firebase(FIREBASE_URI);
    var teams = $firebaseArray(ref);

    service.getTeams = function () {
        return teams;
    };

    service.addTeam = function (team) {
        teams.$add(team);
    };

    service.updateTeam = function (team) {
        teams.$save(team);
    };

    service.removeTeam = function (team) {
        teams.$remove(team);
    };
});

