   angular.module('content.monitortype', ['ibuildweb.factorys', 'ibuildweb.factorys.services'])
       .controller('monitortypeCtrl', monitortypeCtrl)

   function monitortypeCtrl($rootScope, Paginator, devicePoint, toastService, delDialogService, $q, $scope, $timeout, monitorGroup, monitorType, deviceTypeList, $log, $mdSidenav, $state, $mdComponentRegistry, DeviceField) {
       $scope.$on('$stateChangeSuccess', function() {
           if ($state.current.name == "ibuildweb.category.content") {
               load();
           }
       });
       $scope.$on("loadFromParrent", load);

       var query = {};
/*monitorType*/
       function load() {
           $rootScope.query = null;
           $scope.DeviceField = DeviceField;
           $scope.selected = {
               data: null,
               keyword:null,
               device: null,
               monitor: null
           };
           deviceTypeList.filter(null, null, function(data) {
               $scope.DeviceTypeList = data;
           });
           $scope.showData = Paginator(monitorType.filter, 10);
           monitorGroup.filter(null, null, function(data) {
               $scope.MonitorGroupList = data;
           });
       }
       $scope.$watch('selected.data', function() {
           if ($scope.selected.data) {
               query[DeviceField.MNT_GROUP_ID] = $scope.selected.data;
           } else {
               delete query[DeviceField.MNT_GROUP_ID];
           }
       });
         $scope.$watch('selected.keyword', function() {
           if ($scope.selected.keyword) {
            query[DeviceField.DESC] = { "like": '%' + $scope.selected.keyword  + '%' };
           } else {
               delete query[DeviceField.DESC];
           }
       });
       $scope.search = function() {
           $rootScope.query = query;
           $scope.showData._load(0);
       }

       $scope.deviceMap = {};
       $scope.monitorMap = {};
       var k, v;
       $scope.$watch('DeviceTypeList', function() {
           if ($scope.DeviceTypeList) {
               for (var i in $scope.DeviceTypeList) {
                   k = $scope.DeviceTypeList[i][DeviceField.TYPE_ID];
                   v = $scope.DeviceTypeList[i][DeviceField.TYPE_NAME];
                   $scope.deviceMap[k] = v;
               }
           }
           console.log($scope.deviceMap)
       });
       $scope.$watch('MonitorGroupList', function() {
           if ($scope.MonitorGroupList) {
               for (var i in $scope.MonitorGroupList) {
                   k = $scope.MonitorGroupList[i][DeviceField.MNT_GROUP_ID];
                   v = $scope.MonitorGroupList[i][DeviceField.DESC];
                   $scope.monitorMap[k] = v;
               }
           }
           console.log($scope.monitorMap)
       });

       $scope.save = function(obj, type) {
           obj[DeviceField.MNT_GROUP_ID] = $scope.selected.monitor;
           obj[DeviceField.TYPE_ID] = $scope.selected.device;
           monitorType.saveOne(obj, type, function() {
               if ($scope.selected.data) {
                   query[DeviceField.MNT_GROUP_ID] = $scope.selected.data;
                   $rootScope.query = query;
               }
               toastService();
               $scope.showData._load()
           });
       }

       $scope.deleteData = function(obj) {
           delDialogService(function() {
               console.log('delete...');
               monitorType.deleteOne(obj).then(function(data) {
                   if ($scope.selected.data) {
                       query[DeviceField.MNT_GROUP_ID] = $scope.selected.data;
                       $rootScope.query = query;
                   }
                   $scope.showData._load()
               })
           })
       };

       // 自定义设备 查看列表数据 
       $scope._oldSelectedRowObj = [];
       $scope.selectedRow = function(index, obj) {
           if ($scope._oldSelectedRowObj.length > 0) {
               $scope._oldSelectedRowObj.pop();
           }
           $scope._oldSelectedRowObj.unshift(obj);

           $scope.isDel = true;
       };


       $scope.cancel = function() {
           $mdSidenav('right').close();
       };

       $scope.toggleRight = function(obj) {
           if (obj) { /* angular.copy()*/
               $scope.selected.monitor = obj[DeviceField.MNT_GROUP_ID];

               if (obj[DeviceField.TYPE_ID]) {
                   $scope.selected.device = angular.copy(obj[DeviceField.TYPE_ID]);
               }
               $state.go("ibuildweb.category.content.edit", { systype: obj[DeviceField.MNT_TYPE_ID] });

           } else {
               $state.go("ibuildweb.category.content.create");

           }
           // 'No instance found for handle'
           $mdComponentRegistry.when('right').then(function(it) {
               it.toggle();
           });
           $scope.groupFieldName = angular.copy(obj);
           $scope._groupFieldName = angular.copy(obj);
       };

   }
