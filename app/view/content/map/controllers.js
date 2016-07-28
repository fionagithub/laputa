   angular.module('content.map', ['ams.factorys.services', 'ams.factorys'])
       .controller('MapCtrl', MapCtrl)
       .directive('mapInlineTools', mapInlineTools)
       .directive('fileModel', ['$parse', function($parse) {
           return {
               restrict: 'A',
               link: function(scope, element, attrs) {
                   var model = $parse(attrs.fileModel);
                   var modelSetter = model.assign;

                   element.bind('change', function() {
                       scope.$apply(function() {
                           modelSetter(scope, element[0].files[0]);
                       });
                   });
               }
           };
       }])

   function MapCtrl($scope, map, deviceInfo, fileService, uploadService, paginator, delDialogService, toastService, DeviceField, $state, $stateParams, $mdSidenav, $mdComponentRegistry) {
       $scope.$on('$stateChangeSuccess', function() {
           if ($state.current.name == "ams.category.content") {
               load();
           }

       });
       $scope.$on("loadFromParrent", load);

       $scope.map = {
           file: null
       };
       $scope.selected = {
           map: null
       };

       function load() {
           map.filter(null, null, function(data) {
               var _data = new treeMenu(data).init();
               $scope.showData = _data;
               $scope.showAreaData = _data[null];
           });
           $scope.DeviceField = DeviceField;
       }

       $scope.toggleRight = function(obj) {
           var uri = {
               category: $stateParams.category
           };
           var relatedData = {
               'DeviceField': $scope.DeviceField,
               'showAreaData': $scope.showAreaData
           };
           $scope.$emit('relatedData', relatedData);

           if (obj) {
               uri.id = obj[DeviceField.MAP_ID];
               $state.go("ams.category.content.edit", uri);
               $scope.$emit('groupFieldName', obj);
           } else {
               $state.go("ams.category.content.create", uri);
               $scope.$emit('reopen');
           }
           // 'No instance found for handle'
           $mdComponentRegistry.when('right').then(function(it) {
               it.toggle();
           });
       };


       $scope.$on("save", function(event, obj, type) {
           obj ? obj : obj = {};
           obj[DeviceField.SOURCE] = $scope.filename;
           obj[DeviceField.MAP_NO] = $scope.selected.map;
           map.saveOne(obj, type, function() {
               toastService();
           });
       });


       $scope.$on("uploadFileFromParent", function(event, file) {
           var fd = new FormData();
           fd.append('file', file);
           $scope.filename = 'maps/' + file.name;
           fd.append('filename', $scope.filename);
           uploadService.post(fd).then(function() {
               console.log('-=--ok--=-')
           })
       });

       function treeMenu(o) {
           this.tree = o || [];
           this.groups = {};
       };
       treeMenu.prototype = {
           init: function() {
               this.group();
               return this.groups;
           },
           group: function() {
               for (var i = 0; i < this.tree.length; i++) {
                   if (this.groups[this.tree[i].mapno]) {
                       this.groups[this.tree[i].mapno].push(this.tree[i]);
                   } else {
                       this.groups[this.tree[i].mapno] = [];
                       this.groups[this.tree[i].mapno].push(this.tree[i]);
                   }
               }
           }
       };


       // 自定义设备 查看列表数据 remove
       $scope.selectedRow = function(index, obj) {
           obj.open = obj.open === false;
           if (obj[DeviceField.SOURCE]) {
               fileService.fileConfig().then(function(data) {
                   $scope.showMapUri = data.data.img_path + obj[DeviceField.SOURCE];
                   console.log('---' + data.data) // imgUir Config
               })
           }
       };

       $scope.deleteData = function(obj) {
           delDialogService(function() {
               console.log('delete...');
               map.deleteOne(obj).then(function(data) {})
           })
       };


   }

   function mapInlineTools($templateRequest, $compile) {
       return {
           scope: true,
           restrict: 'C',
           link: function(scope, element) {
               element.on("click", function(event) {
                   angular.element(document.querySelector('.map .selected')).removeClass('selected');
                   angular.element(element).addClass('selected');
                   scope.$apply(function() {
                       $templateRequest("../view/content/map/tool.html").then(function(html) {
                           angular.element(document.querySelector('.tools')).remove($compile(html)(scope));
                           angular.element(element).append($compile(html)(scope));
                       });
                   })
               });
           }
       }
   }
