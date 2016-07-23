angular.module('content.deviceType', ['ams.factorys', 'ams.factorys.services'])
    .controller('DeviceTypeCtrl', DeviceTypeCtrl)

function DeviceTypeCtrl($scope, deviceTypeList, deviceSysTypeList, deviceInfo, paginator, delDialogService, toastService, DeviceField, $rootScope, $state, $mdSidenav, $mdComponentRegistry) {
    $scope.$on('$stateChangeSuccess', function() {
        if ($state.current.name == "ams.category.content") {
            load();
        }
    });
    var query = {};

    $scope.$on("loadFromParrent", load);

    function load() {
        $rootScope.query = null;
        $scope.searchDeviceType = null;
        $scope.deviceSysTypeData = null;
        $scope.data = {
            deviceSys: null,
            deviceTypeField: null
        };
        $scope.showData = paginator(deviceTypeList.filter, 10);
        $scope.DeviceField = DeviceField;
        deviceSysTypeList.filter(null, null, function(data) {
            $scope.DeviceSysTypeList = data;
        });
    }
    $scope.sysMap = {};
    var k, v;
    $scope.$watch('DeviceSysTypeList', function() {
        if ($scope.DeviceSysTypeList) {
            for (var i in $scope.DeviceSysTypeList) {
                k = $scope.DeviceSysTypeList[i][DeviceField.SYS_TYPE_ID];
                v = $scope.DeviceSysTypeList[i][DeviceField.SYS_TYPE_NAME];
                $scope.sysMap[k] = v;
            }
        }
        console.log($scope.sysMap)
    });


    $scope.$watch('searchDeviceType', function() {
        if ($scope.searchDeviceType) {
            query[DeviceField.TYPE_NAME] = { "like": '%' + angular.copy($scope.searchDeviceType) + '%' };
            console.log("----" + query);
        } else {
            delete query[DeviceField.TYPE_NAME];
        }
    });
    $scope.$watch('deviceSysTypeData', function() {
        if ($scope.deviceSysTypeData) {
            query[DeviceField.SYS_TYPE_ID] = angular.copy($scope.deviceSysTypeData);
        } else {
            delete query[DeviceField.SYS_TYPE_ID];
        }
    });

    $scope.deleteData = function(obj) {
        delDialogService(function() {
            console.log('delete...');
            deviceTypeList.deleteOne(obj).then(function(data) {
                if ($scope.deviceSysTypeData) {
                    query[DeviceField.SYS_TYPE_ID] = angular.copy($scope.deviceSysTypeData);
                    $rootScope.query = query;
                }
                $scope.showData._load(0);
            })
        })
    };
    $scope.search = function() {
        $rootScope.query = query;
        $scope.showData._load(0);
    }

    $scope._oldSelectedRowObj = [];
    // 自定义设备 查看列表数据 
    $scope.selectedRow = function(index, obj) {
        if ($scope._oldSelectedRowObj.length > 0) {
            $scope._oldSelectedRowObj.pop();
        }
        $scope._oldSelectedRowObj.unshift(obj);
        query = [];
        query[DeviceField.TYPE_ID] = obj[DeviceField.TYPE_ID];
        $rootScope.query = query;
        deviceInfo.filter(null, null, function(data) {
            if (data.length > 0) {
                $scope.isDel = false;
                console.log('存在子数据...');
            } else {
                $scope.isDel = true;
            }
            delete query[DeviceField.TYPE_ID];
        })
    };

    $scope.save = function(obj, type) {
        obj ? obj : obj = {};
        obj[DeviceField.SYS_TYPE_ID] = angular.copy($scope.data.deviceSys);
        deviceTypeList.saveOne(obj, type, function() {
            delete query[DeviceField.SYS_TYPE_ID];
            if ($scope.deviceSysTypeData) {
                query[DeviceField.SYS_TYPE_ID] = $scope.deviceSysTypeData;
                $rootScope.query = query;
            }
            toastService();
            $scope.showData._load()
        })
    }

    $scope.cancel = function() {
        $mdSidenav('right').close();
        $scope.data = {
            deviceSys: null,
            deviceTypeField: null
        };
    };

    $scope.$watch('data.deviceSys ', function() {
        if ($scope.data.deviceSys) {
            query[DeviceField.SYS_TYPE_ID] = angular.copy($scope.data.deviceSys);

        }
    });
    $scope.getSelectedText = function(obj) {
        if (obj !== undefined) {
            return obj;
        } else {
            return " ";
        }
    };

    $scope.toggleRight = function(obj) { 
        if (obj) {
            $state.go("ams.category.content.edit", { id: obj[DeviceField.TYPE_ID] });
            $scope.data.deviceTypeField = angular.copy(obj);
            $scope.data.deviceSys = obj[DeviceField.SYS_TYPE_ID];
        } else {
            $state.go("ams.category.content.create");
            $scope.data = {
                deviceSys: null,
                deviceTypeField: null
            };
        }
        // 'No instance found for handle'
        $mdComponentRegistry.when('right').then(function(it) {
            it.toggle();
        });
    };
}

/* */