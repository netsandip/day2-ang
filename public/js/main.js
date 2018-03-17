/**
 * AngularJS Tutorial 1
 * @author Nick Kaye <nick.c.kaye@gmail.com>
 */

/**
 * Main AngularJS Web Application
 */
var app = angular.module('tutorialWebApp', [
  'ngRoute', 'firebase', 'ngAnimate', 'ngTouch', 'ui.grid', 'tutorialWebApp.factories',
  'timer'
]);

app.
directive('myMap', ['$http', function($http) {
    // directive link function
    var link = function(scope, element, attrs) {
        var map, infoWindow;
        var markers = [];
        
        // map config
        var mapOptions = {
            center: new google.maps.LatLng(50, 2),
            zoom: 8,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: false
        };
        
        // init the map
        function initMap() {
            if (map === void 0) {
                map = new google.maps.Map(element[0], mapOptions);
            }
        }    
        
        // place a marker
        function setMarker(map, position, title, content) {
            var marker;
            var markerOptions = {
                position: position,
                map: map,
                title: title,
                icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
            };

            marker = new google.maps.Marker(markerOptions);
            markers.push(marker); // add marker to array
            
            google.maps.event.addListener(marker, 'click', function () {
                // close window if not undefined
                if (infoWindow !== void 0) {
                    infoWindow.close();
                }
                // create new window
                var infoWindowOptions = {
                    content: content
                };
                infoWindow = new google.maps.InfoWindow(infoWindowOptions);
                infoWindow.open(map, marker);
            });
        }
        
        // show the map and place some markers
        initMap();
        
        // $.ajax({       
        //     url: 'http://www.chip2cloud.net:3777/ustIoTTransaction/GetDeviceWiseTransactionInfo?931',
        //     success: function (data) {
        //         console.log(data);
        //         for (var index = 0; index < data.length; index++) {
        //             var element = data[index];

        //             console.log("map " + element.values.Data);
                    
        //         }
        //     }
        // })

        $http.get('https://ustfoundationday.herokuapp.com/getdeviceCodeForLocation')
        .then(function (response){
                    //$scope.gridOptions.data = response.data;

                    for (var index = 0; index < 10; index++) {
                            var element = response.data[index];
                           console.log(element); 
                            setMarker(map, new google.maps.LatLng(element.Lat, element.Lon), 'element.deviceCode', 'element.TransactionDate');                            
                        
                    }
                              
            console.log("status:" + response.status);
        }).catch(function(response) {
          console.error('Error occurred:', response.status, response.data);
        }).finally(function() {
             console.log("Task Finished.");
        });

        
    };
    
    return {
        restrict: 'A',
        template: '<div id="gmaps"></div>',
        replace: true,
        link: link
    };
}]);


/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      // Home
      .when("/", { templateUrl: "partials/accident.html", controller: "AccidentCtrl" })
      // Pages
      .when("/live", { templateUrl: "partials/livemap.html", controller: "MapCtrl" }) 
      .when("/lucky", { templateUrl: "partials/Luckygenerate.html", controller: "PageCtrl" })
       .when("/vote", { templateUrl: "partials/Vote.html", controller: "VoteCtrl" })
      .when("/chart", { templateUrl: "partials/Chart.html", controller: "PageCtrl" })
        .when("/admin", { templateUrl: "partials/admin.html", controller: "AdminCtrl" })
      // else 404
      .otherwise("/404", { templateUrl: "partials/404.html", controller: "PageCtrl" });
}]);

/**
 * Controls the Blog
 */
app.controller('MapCtrl', function (/* $scope, $location, $http */) {

});

/**
 * Controls all other Pages
 */
app.controller('PageCtrl', function ($scope,$rootScope, $firebaseArray, $firebaseObject, fireBaseData) {
    console.log("Page Controller reporting for duty.");
    $rootScope.btnEnablenew = true;;
    var appref = new Firebase("https://ustdb.firebaseio.com/userRegistration");
    // Attach an asynchronous callback to read the data at our posts reference   

    $scope.RegisteredUsers = $firebaseArray(appref);
    $scope.RegisteredUsers.$loaded().then(function (data) {
        console.log('Initial data loaded', data.length);
        $scope.AppCount = data.length;
    });

    var fdref = new Firebase("https://ustdb.firebaseio.com/fdRegisteredUsers");
    // Attach an asynchronous callback to read the data at our posts reference   

    $scope.fdRegisteredUsers = $firebaseArray(fdref);
    $scope.fdRegisteredUsers.$loaded().then(function (data) {
        console.log('Initial data loaded', data.length);
        $scope.fdCount = data.length;
    });
    var ref = new Firebase("https://ustdb.firebaseio.com/voteDashBoard");
    // Attach an asynchronous callback to read the data at our posts reference
    ref.on("value", function (snapshot) {
        console.log(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });



    $scope.RegisterButton = function () {

        var strValidUserCheck = "";
        $scope.userdetails = $firebaseArray(fireBaseData.refListUid());
        $scope.userdetails.$loaded().then(function (userdetails) {
            strValidUserCheck = $scope.userdetails.filter(function (user) {
                return user.userId.toUpperCase() == $scope.UID.toUpperCase()
            })
            //  });

            if (strValidUserCheck.length > 0) {
                var CurrentDate = new Date();
                $scope.fdRegusers = $firebaseArray(fdref);
                $scope.fdRegusers.$loaded().then(function (fdRegusers) {
                    console.log("hi");
                    flag = $scope.fdRegusers.filter(function (userlist) { return userlist.userId.toUpperCase() == $scope.UID.toUpperCase() }); //$scope.user.userId

                    if (flag.length == 0) {
                        $scope.saveReguserdetails = $scope.fdRegusers.$add({
                            userName: $scope.Name,
                            userId: $scope.UID,
                            lastRegistered: CurrentDate.toLocaleString()
                        }).then(function (fdRegusers) {
                            var syncObject = $firebaseArray(fdref);
                            //$scope.fdRegisteredUsers = $firebase(fdref);
                            syncObject.$loaded().then(function (data) {
                                console.log('Initial data loaded', data.length);
                                $scope.fdCount = data.length;
                            });
                            $scope.message = 'Success!!';
                            $scope.UID = null;
                            $scope.Name = null;
                            //   console.log(ref);
                        }, function (error) {
                            //console.log("Error:", error);
                        });
                    }
                    else {
                        alert("Already registered!!");
                        $scope.message = "Already registered!!";
                    }
                })
            }
            else {
                $scope.message = 'Duplicate Entry!!';
                alert("Please input valid UST User ID!!");
            }
        })

        flag = true;


    }
});

app.controller('AccidentCtrl', function ($scope,$rootScope, $firebaseArray, $firebaseObject, fireBaseData, $http) {
    console.log("Page Controller reporting for duty.");

    $scope.gridOptions = {
        enableFiltering: true,        
        columnDefs: [
          // default
          { field: 'deviceCode', displayName: "Vehicle Identification Number", headerCellClass: $scope.highlightFilteredHeader, width: '20%' },
          { field: 'ProjectName', displayName: "Device Name", headerCellClass: $scope.highlightFilteredHeader, width: '20%' },
          { field: 'Lon', displayName: "Longitude", headerCellClass: $scope.highlightFilteredHeader, width: '20%' },
          { field: 'Lat', displayName: "Lattitude", headerCellClass: $scope.highlightFilteredHeader, width: '20%' },
          {
              field: 'TransactionDate', displayName: "Transaction Date", width: '40%',
          }
        ]
    };

    // $.ajax({       
    //     url: 'https://ustfoundationday.herokuapp.com/getdeviceCodeForLocation',
    //     success: function (data) {            
    //         $scope.gridOptions.data = data;
    //         $scope.AccidentCount = data.length;            
    //     }
    // })
    // setfilledSection();
    // setInterval(function () { setfilledSection(); }, 3000);
    // })           

    
    $scope.redirect = function(){
        window.location = "#/live";
      }

    $http.get('https://ustfoundationday.herokuapp.com/getdeviceCodeForLocation')
    .then(function (response){
                $scope.gridOptions.data = response.data;
            $scope.AccidentCount = response.data.length;                
        console.log("status:" + response.status);
    }).catch(function(response) {
      console.error('Error occurred:', response.status, response.data);
    }).finally(function() {
         console.log("Task Finished.");
    });

});


app.controller('MainCtrl', ['$scope', '$http', 'uiGridConstants', '$firebaseArray', function ($scope, $http, uiGridConstants, $firebaseArray) {
    var today = new Date();
    var nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
        if (col.filters[0].term) {
            return 'header-filtered';
        } else {
            return '';
        }
    };

    var fdref = new Firebase("https://ustdb.firebaseio.com/fdRegisteredUsers");
    // Attach an asynchronous callback to read the data at our posts reference   



    $scope.gridOptions = {
        enableFiltering: true,
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        },
        columnDefs: [
          // default
          { field: 'userName', displayName: "Name", headerCellClass: $scope.highlightFilteredHeader, width: '30%' },
          { field: 'userId', displayName: "UID", headerCellClass: $scope.highlightFilteredHeader, width: '30%' },
          {
              field: 'lastRegistered', displayName: "Reg Date", cellFilter: 'date:"longDate"', filterCellFiltered: true, width: '40%',
          }
        ]
    };

    $.ajax({       
        url: 'https://pacserver.herokuapp.com/getRegisterationDetails',
        success: function (data) {
            $scope.gridOptions.data = data;
        }
    });
  


}])
.filter('mapGender', function () {
    var genderHash = {
        1: 'male',
        2: 'female'
    };

    return function (input) {
        if (!input) {
            return '';
        } else {
            return genderHash[input];
        }
    };
});


app.controller('VoteCtrl', function ($scope,$rootScope, $firebaseArray, fireBaseData, $window, $route) {
    $scope.Employees = []

    //$firebaseArray(fireBaseData.refEmpList());
    $.ajax({
        url: 'https://pacserver.herokuapp.com/getVoterInformation',
        success: function (data) {
            $scope.Employees = data.voterInfo;

        }
    })

    console.log("$rootScope", $rootScope.btnEnablenew)

    $scope.v = {};
    $scope.isDisable = false;
    //$rootScope.btnEnable = false;

    $scope.doSaveVote = function (v) {
        var foundnumber = "";
        $scope.isDuplicate = false;
        $scope.EmpVoteCounts = "";

        // $scope.EmpVoteCounts = $firebaseArray(fireBaseData.refVoteCount());       
        $.ajax({
            type: 'Post',
            url: 'https://pacserver.herokuapp.com/validateVote',
            data: { "employeeUID": $scope.userEmailId },
            success: function (data) {
                if (data.success == "true") {
                    $scope.isDuplicate = false;
                }
                else if (data.success == false) { $scope.isDuplicate = true; }
            }
        })

        //$scope.EmpVoteCounts.$loaded.then(function (EmpVoteCounts) {
        //    console.log(EmpVoteCounts);
        //    angular.forEach(EmpVoteCounts, function (emp) {
        //        if (emp.voterId == $scope.userEmailId + "@ust-global.com") {
        //            $scope.v = emp.voteTo;
        //            // $scope.isDisable = true;
        //            $scope.isDuplicate = true;

        //        }
        //    });
        //});


        $scope.validUserId = $firebaseArray(fireBaseData.refListUid());
        $scope.validUserId.$loaded().then(function (validUserId) {
            foundnumber = $scope.validUserId.filter(function (validUserId) { return validUserId.userId == $scope.userEmailId })
        })
        $scope.userdetails = $firebaseArray(fireBaseData.refListUid());
        $scope.userdetails.$loaded().then(function (userdetails) {
            foundnumber = $scope.userdetails.filter(function (user) {
                return user.userId.toUpperCase() == $scope.userEmailId.toUpperCase()
            });



            // });
            //var userEmailId = $scope.userEmailId;
            if (foundnumber.length > 0 && $scope.userEmailId != undefined && $scope.userEmailId != "") {
                if (!$scope.isDuplicate) {
                    var confirmPopup = $window.confirm('please confirm your selection(Ok for confirm)?');
                    if (confirmPopup) {
                        // $scope.isDisable = true;
                        //$scope.saveEmpVoteCounts = $scope.EmpVoteCounts.$add({
                        //    voterId: $scope.userEmailId + "@ust-global.com",
                        //    voteTo: v.choice
                        //}).then(function (ref) {
                        //    console.log(ref);
                        //}, function (error) {
                        //    console.log("Error:", error);
                        //});
                        //$scope.Employees.$loaded().then(function (Employees) { });
                        angular.forEach($scope.Employees, function (emp, value) {
                           
                            if (emp.UID == v.choice) {
                                
                                $.ajax({
                                    type: 'Post',
                                    url: 'https://pacserver.herokuapp.com/VotetoUID',
                                    data: {                                        
                                        "employeeUID": $scope.userEmailId,
                                        "voteToUID": v.choice

                                        
                                    },
                                    success: function (data) {
                                        console.log("savedata", data)
                                       
                                    }
                                })
                                
                            };
                        });

                        $route.reload();

                    }

                } else {
                    alert("Already Voted!!");
                    $route.reload();
                }
            }
            else {
                alert("Enter a valid UID");
                $route.reload();
            }
        })
    }

});
app.controller('AdminCtrl', function ($scope, $rootScope, $firebaseArray, fireBaseData, $window, $route,$http) {
   
    $rootScope.showvotingcount = function () {
        //$scope.newEmployees = []
        //$firebaseArray(fireBaseData.refEmpList());
        $.ajax({
            url: 'https://pacserver.herokuapp.com/getVoterInformation',
            success: function (data) {
               
                $scope.newEmployees = data.voterInfo;
                console.log('$scope.newEmployees', $scope.newEmployees)
            }
        })
    }
    $scope.votecount = "";
    $rootScope.UpdateRecord = function () {
        console.log('$scope.newEmployees', $scope.selectemp)
        $http({
            url: 'https://pacserver.herokuapp.com/parseVote',
            method: "POST",
            data: {
                "voteToUID": $scope.selectemp,
                "count": $scope.votecount
    },
            headers: { 'Content-Type': 'application/json' }
        }).success(function (data) {
            console.log('$scope.newEmployees', data) // assign  $scope.persons here as promise is resolved here 
        }).error(function (data) {
            console.log('error', data)
        });
        //$.ajax({
        //    type:'post',
        //    url: 'https://pacserver.herokuapp.com/parseVote',
        //    dataType:json,
        //    body: {
        //        "voteToUID": $scope.selectemp,
        //        "count": $scope.votecount
        //    },
        //    success: function (data) {
               
        //        console.log('$scope.newEmployees', data)
        //    }
        //})
    }

    $scope.Enable = true;   
    $rootScope.btnEnablenew = false;
    $scope.ButtonText = "Disable Voting";
    $scope.VoteReset = function () {    

        $.ajax({
            type:'Post',
            url: 'https://pacserver.herokuapp.com/resetvotecount',
            success: function (data) {
                console.log("data11", data)
            }
        })
        //$scope.Employees = $firebaseArray(fireBaseData.refEmpList());
        //$scope.EmpVoteCounts = $firebaseArray(fireBaseData.refVoteCount());
        //$scope.Employees.$loaded().then(function (Employees) {
        //    angular.forEach(Employees, function (emp, value) {
        //        var ref = new Firebase('https://ustdb.firebaseio.com/employeeList/' + value);
        //        ref.update({ "totalVote": 0 });
        //    });

        //});
        //$scope.EmpVoteCounts.$loaded().then(function (EmpVoteCounts) {
        //    angular.forEach(EmpVoteCounts, function (emp, value) {
        //        var ref = new Firebase('https://ustdb.firebaseio.com/empVoteCount/' + emp.$id);
        //        ref.remove();
        //    });
        //});
    }

    $scope.FDReset = function () {
        $scope.FdRegusers = $firebaseArray(fireBaseData.refFdRegusers());
        $scope.FdRegusers.$loaded().then(function (FdRegusers) {
            angular.forEach(FdRegusers, function (emp, value) {
                var ref = new Firebase('https://ustdb.firebaseio.com/fdRegisteredUsers/' + emp.$id);
                ref.remove();
            });
        });
    }

    $scope.EnableDisableVoting = function () {
       
        $.ajax({
            type: 'Post',
            url: 'https://pacserver.herokuapp.com/actionVote',
            data: { "action": $scope.Enable },
            success: function (data) {
                console.log("data11", data);
                if ($scope.Enable == true) {                    
                    $scope.ButtonText = "Enable Voting";
                } else { $scope.ButtonText = "Disable Voting"; }
               
                $scope.Enable = !$scope.Enable;
                $rootScope.btnEnablenew = !$rootScope.btnEnablenew;
            }
        })

        //$scope.Employees = $firebaseArray(fireBaseData.refEmpList());
        //var flag = 1;
        //if ($scope.Enable) {
        //    flag = 0
        //    $scope.Enable = false;;
        //    $scope.ButtonText = "Enable Voting";
        //}
        //else {
        //    flag = 1;
        //    $scope.Enable = true;;
        //    $scope.ButtonText = "Disable Voting";
        //}

        //$scope.Employees.$loaded().then(function (Employees) {
        //    angular.forEach(Employees, function (emp, value) {
        //        var ref = new Firebase('https://ustdb.firebaseio.com/employeeList/' + value);
        //        ref.update({ "isActive": flag });
        //    });

        //});
    }

    $scope.AddUser = function () {
        if (!$scope.userEmailId) {
            alert("Enter a valid UID");
            return
        }
        var alreadyExists = false;
        $scope.EmpUIDs = $firebaseArray(fireBaseData.refListUid());
        $scope.EmpUIDs.$loaded().then(function (EmpUIDs) {
            angular.forEach(EmpUIDs, function (emp) {
                if (emp.userId == $scope.userEmailId) {
                    alreadyExists = true;
                }
            });
            if (!alreadyExists) {

                $scope.EmpUIDs.$add({
                    userId: $scope.userEmailId
                }).then(function (ref) {
                    console.log(ref);
                }, function (error) {
                    console.log("Error:", error);
                });
                //$scope.userEmailId = null;
            }
            else {
                alert("Already Exists!!");
            }
        });


    }
});