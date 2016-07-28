   angular.module('content.monitortype', ['ams.factorys', 'ams.factorys.services'])
       .controller('MonitortypeCtrl', MonitortypeCtrl)

   function MonitortypeCtrl($scope, monitorGroup, monitorType, devicePoint, deviceTypeList, paginator, delDialogService, toastService, DeviceField, $rootScope, $state, $stateParams, $mdSidenav, $mdComponentRegistry) {
       $scope.$on('$stateChangeSuccess', function() {
           if ($state.current.name == "ams.category.content") {
               load();
           }
       });
       $scope.$on("loadFromParrent", load);

       var query = {};

       function load() {
           $rootScope.query = null;
           $scope.DeviceField = DeviceField;
           $scope.selected = {
               data: null,
               keyword: null
           };
           deviceTypeList.filter(null, null, function(data) {
               $scope.DeviceTypeList = data;
           });
           $scope.showData = paginator(monitorType.filter, 10);
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
               query[DeviceField.DESC] = { "like": '%' + $scope.selected.keyword + '%' };
           } else {
               delete query[DeviceField.DESC];
           }
       });

       $scope.toggleRight = function(obj) {
           var uri = {
               category: $stateParams.category
           };
           var relatedData = {
               'DeviceField': $scope.DeviceField,
               'MonitorGroupList': $scope.MonitorGroupList,
               'DeviceTypeList': $scope.DeviceTypeList
           };
           $scope.$emit('relatedData', relatedData);

           if (obj) {
               uri.id = obj[DeviceField.MNT_TYPE_ID];
               $state.go("ams.category.content.edit", uri);
               $scope.$emit('groupFieldName', angular.copy(obj));
           } else {
               $state.go("ams.category.content.create");
               $scope.$emit('reopen');
           }
           // 'No instance found for handle'
           $mdComponentRegistry.when('right').then(function(it) {
               it.toggle();
           });
       };


       $scope.search = function() {
           $rootScope.query = query;
           $scope.showData._load(0);
       }

       var k, v;
       $scope.$watch('DeviceTypeList', function() {
           $scope.deviceMap = {};
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
           $scope.monitorMap = {};
           if ($scope.MonitorGroupList) {
               for (var i in $scope.MonitorGroupList) {
                   k = $scope.MonitorGroupList[i][DeviceField.MNT_GROUP_ID];
                   v = $scope.MonitorGroupList[i][DeviceField.DESC];
                   $scope.monitorMap[k] = v;
               }
           }
           console.log($scope.monitorMap)
       });


       $scope.$on("saveFromParent", function(event, obj, type) {
           obj ? obj : obj = {};
           /*        obj[DeviceField.MNT_GROUP_ID] = $scope.selected.monitor;
                   obj[DeviceField.TYPE_ID] = $scope.selected.device;
                 */
           monitorType.saveOne(obj, type, function() {
               if ($scope.selected.data) {
                   query[DeviceField.MNT_GROUP_ID] = $scope.selected.data;
                   $rootScope.query = query;
               }
               toastService();
               $scope.showData._load()
           });
       });


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
       }

       // 自定义设备 查看列表数据 
       $scope._oldSelectedRowObj = [];
       $scope.selectedRow = function(index, obj) {
           if ($scope._oldSelectedRowObj.length > 0) {
               $scope._oldSelectedRowObj.pop();
           }
           $scope._oldSelectedRowObj.unshift(obj);

           $scope.isDel = true;
       };

   }
