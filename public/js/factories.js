angular.module('tutorialWebApp.factories', [])

.factory('fireBaseData', function ($FirebaseObject) {

    //var refEventsList = new Firebase("https://ustdb.firebaseio.com/eventsList");
    var refVoteDashBoard = new Firebase("https://ustdb.firebaseio.com/voteDashBoard");
    var refEmpList = new Firebase("https://ustdb.firebaseio.com/employeeList");
    var refVoteCount = new Firebase("https://ustdb.firebaseio.com/empVoteCount");

    //var refEventsDetails = new Firebase("https://ustdb.firebaseio.com/eventDetails");

    var refFdRegusers = new Firebase("https://ustdb.firebaseio.com/fdRegisteredUsers");
    var refListUid = new Firebase("https://ustdb.firebaseio.com/listUid");

    return {
        refRegisteration: function () {
            return refRegisteration;
            // return Math.max.apply(Math, refRegisteration.map(function (item) { return item.id; }));

        },
        //return {
        //    all: function() {
        //        return refRegisteration
        //    },

        refVoteDashBoard: function () {
            return refVoteDashBoard;
        },
        refEmpList: function () {
            return refEmpList;
        },
        refVoteCount: function () {
            return refVoteCount;
        },
        refEventsDetails: function () {
            return refEventsDetails;
        },
        refListUid: function () {
            return refListUid;
        },
        refFdRegusers: function () {
            return refFdRegusers;

        }

    };
})