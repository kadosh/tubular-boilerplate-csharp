(function () {
    'use strict';

    angular.module('tubular-hchart.directives', ['tubular.services', 'highcharts-ng'])
        /**
         * @ngdoc directive
         * @name tbHighcharts
         * @restrict E
         *
         * @description
         * The `tbHighcharts` directive is the base to create any Highcharts component.
         * 
         * @scope
         * 
         * @param {string} serverUrl Set the HTTP URL where the data comes.
         * @param {string} chartName Defines the chart name.
         * @param {string} chartType Defines the chart type.
         * @param {string} title Defines the title.
         * @param {bool} requireAuthentication Set if authentication check must be executed, default true.
         * @param {function} onLoad Defines a method to run in chart data load
         * @param {string} emptyMessage The empty message.
         * @param {string} errorMessage The error message.
         * @param {object} options The Highcharts options method.
         */
        .directive('tbHighcharts', [
            function () {
                return {
                    template: '<div class="tubular-chart">' +
                        '<highchart config="options" ng-hide="isEmpty || hasError">' +
                        '</highchart>' +
                        '<div class="alert alert-info" ng-show="isEmpty">{{emptyMessage}}</div>' +
                        '<div class="alert alert-warning" ng-show="hasError">{{errorMessage}}</div>' +
                        '</div>',
                    restrict: 'E',
                    replace: true,
                    scope: {
                        serverUrl: '@',
                        title: '@?',
                        requireAuthentication: '=?',
                        name: '@?chartName',
                        chartType: '@?',
                        emptyMessage: '@?',
                        errorMessage: '@?',
                        onLoad: '=?',
                        options: '=?'
                    },
                    controller: [
                        '$scope', 'tubularHttp',
                        function ($scope, tubularHttp) {
                            $scope.tubularDirective = 'tubular-chart';
                            $scope.dataService = tubularHttp.getDataService($scope.dataServiceName);
                            $scope.showLegend = $scope.showLegend || true;
                            $scope.chartType = $scope.chartType || 'line';

                            $scope.options = angular.extend({}, $scope.options, {
                                options: { chart: { type: $scope.chartType } },
                                title: { text: $scope.title || '' },
                                xAxis: {
                                    categories: []
                                },
                                yAxis: {},
                                series: []
                            });


                            // Setup require authentication
                            $scope.requireAuthentication = angular.isUndefined($scope.requireAuthentication) ? true : $scope.requireAuthentication;

                            $scope.loadData = function () {
                                tubularHttp.setRequireAuthentication($scope.requireAuthentication);
                                $scope.hasError = false;

                                tubularHttp.get($scope.serverUrl).promise.then(function (data) {
                                    if (!data || !data.Data || data.Data.length === 0) {
                                        $scope.isEmpty = true;
                                        $scope.options.series = [{ data: [] }];

                                        if ($scope.onLoad) {
                                            $scope.onLoad($scope.options, {});
                                        }

                                        return;
                                    }

                                    $scope.isEmpty = false;

                                    if (data.Series) {
                                        $scope.options.xAxis.categories = data.Labels;
                                        $scope.options.series = data.Series.map(function (el, ix) {
                                            return {
                                                name: el,
                                                data: data.Data[ix]
                                            };
                                        });
                                    } else {
                                        var uniqueSerie = data.Labels.map(function (el, ix) {
                                            return {
                                                name: el,
                                                y: data.Data[ix]
                                            };
                                        });

                                        $scope.options.series = [{ name: data.SerieName || '', data: uniqueSerie, showInLegend: (data.SerieName || '') != '' }];
                                    }

                                    if ($scope.onLoad) {
                                        $scope.onLoad($scope.options, data);
                                    }
                                }, function (error) {
                                    $scope.$emit('tbChart_OnConnectionError', error);
                                    $scope.hasError = true;
                                });
                            };

                            $scope.$watch('serverUrl', function (val) {
                                if (angular.isDefined(val) && val != null && val != '') {
                                    $scope.loadData();
                                }
                            });

                            $scope.$watch('chartType', function (val) {
                                if (angular.isDefined(val) && val != null) {
                                    $scope.options.options.chart.type = val;
                                }
                            });
                        }
                    ]
                };
            }
        ]);
})();
/**
 * highcharts-ng
 * @version v0.0.9-dev - 2015-02-25
 * @link https://github.com/pablojim/highcharts-ng
 * @author Barry Fitzgerald <>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
"undefined"!=typeof module&&"undefined"!=typeof exports&&module.exports===exports&&(module.exports="highcharts-ng"),function(){"use strict";function a(){return{indexOf:function(a,b,c){void 0===c&&(c=0),0>c&&(c+=a.length),0>c&&(c=0);for(var d=a.length;d>c;c++)if(c in a&&a[c]===b)return c;return-1},prependMethod:function(a,b,c){var d=a[b];a[b]=function(){var a=Array.prototype.slice.call(arguments);return c.apply(this,a),d?d.apply(this,a):void 0}},deepExtend:function a(b,c){if(angular.isArray(c)){b=angular.isArray(b)?b:[];for(var d=0;d<c.length;d++)b[d]=a(b[d]||{},c[d])}else if(angular.isObject(c))for(var e in c)b[e]=a(b[e]||{},c[e]);else b=c;return b}}}function b(a,b){var c=0,d=function(a){var b=!1;return angular.forEach(a,function(a){angular.isDefined(a.id)||(a.id="series-"+c++,b=!0)}),b},e=["xAxis","yAxis"],f={stock:"StockChart",map:"Map",chart:"Chart"},g=function(b,c,d){var f={},g={chart:{events:{}},title:{},subtitle:{},series:[],credits:{},plotOptions:{},navigator:{enabled:!1}};return f=d.options?a.deepExtend(g,d.options):g,f.chart.renderTo=c[0],angular.forEach(e,function(c){angular.isDefined(d[c])&&(f[c]=angular.copy(d[c]),(angular.isDefined(d[c].currentMin)||angular.isDefined(d[c].currentMax))&&(a.prependMethod(f.chart.events,"selection",function(a){var d=this;b.$apply(a[c]?function(){b.config[c].currentMin=a[c][0].min,b.config[c].currentMax=a[c][0].max}:function(){b.config[c].currentMin=d[c][0].dataMin,b.config[c].currentMax=d[c][0].dataMax})}),a.prependMethod(f.chart.events,"addSeries",function(){b.config[c].currentMin=this[c][0].min||b.config[c].currentMin,b.config[c].currentMax=this[c][0].max||b.config[c].currentMax})))}),d.title&&(f.title=d.title),d.subtitle&&(f.subtitle=d.subtitle),d.credits&&(f.credits=d.credits),d.size&&(d.size.width&&(f.chart.width=d.size.width),d.size.height&&(f.chart.height=d.size.height)),f},h=function(a,b){var c=a.getExtremes();(b.currentMin!==c.dataMin||b.currentMax!==c.dataMax)&&a.setExtremes(b.currentMin,b.currentMax,!1)},i=function(a,b,c){(b.currentMin||b.currentMax)&&a[c][0].setExtremes(b.currentMin,b.currentMax,!0)},j=function(b){return a.deepExtend({},b,{data:null,visible:null})},k=function(a){return void 0===a.config?"Chart":f[(""+a.config.chartType).toLowerCase()]||(a.config.useHighStocks?"StockChart":"Chart")};return{restrict:"EAC",replace:!0,template:"<div></div>",scope:{config:"=",disableDataWatch:"="},link:function(c,f){var l={},m=function(b){var e,f=[];if(b){var g=d(b);if(g)return!1;if(angular.forEach(b,function(a){f.push(a.id);var b=n.get(a.id);b?angular.equals(l[a.id],j(a))?(void 0!==a.visible&&b.visible!==a.visible&&b.setVisible(a.visible,!1),b.setData(angular.copy(a.data),!1)):b.update(angular.copy(a),!1):n.addSeries(angular.copy(a),!1),l[a.id]=j(a)}),c.config.noData){var h=!1;for(e=0;e<b.length;e++)if(b[e].data&&b[e].data.length>0){h=!0;break}h?n.hideLoading():n.showLoading(c.config.noData)}}for(e=n.series.length-1;e>=0;e--){var i=n.series[e];"highcharts-navigator-series"!==i.options.id&&a.indexOf(f,i.options.id)<0&&i.remove(!1)}return!0},n=!1,o=function(){n&&n.destroy(),l={};var a=c.config||{},b=g(c,f,a),d=a.func||void 0,h=k(c);n=new Highcharts[h](b,d);for(var j=0;j<e.length;j++)a[e[j]]&&i(n,a[e[j]],e[j]);a.loading&&n.showLoading(),a.getHighcharts=function(){return n}};o(),c.disableDataWatch?c.$watchCollection("config.series",function(a){m(a),n.redraw()}):c.$watch("config.series",function(a){var b=m(a);b&&n.redraw()},!0),c.$watch("config.title",function(a){n.setTitle(a,!0)},!0),c.$watch("config.subtitle",function(a){n.setTitle(!0,a)},!0),c.$watch("config.loading",function(a){a?n.showLoading(a===!0?null:a):n.hideLoading()}),c.$watch("config.noData",function(a){c.config&&c.config.loading&&n.showLoading(a)},!0),c.$watch("config.credits.enabled",function(a){a?n.credits.show():n.credits&&n.credits.hide()}),c.$watch(k,function(a,b){a!==b&&o()}),angular.forEach(e,function(a){c.$watch("config."+a,function(b,c){if(b!==c&&b){if(angular.isArray(b))for(var d=0;d<b.length;d++){var e=b[d];d<n[a].length&&(n[a][d].update(e,!1),h(n[a][d],angular.copy(e)))}else n[a][0].update(b,!1),h(n[a][0],angular.copy(b));n.redraw()}},!0)}),c.$watch("config.options",function(a,b,c){a!==b&&(o(),m(c.config.series),n.redraw())},!0),c.$watch("config.size",function(a,b){a!==b&&a&&n.setSize(a.width||void 0,a.height||void 0)},!0),c.$on("highchartsng.reflow",function(){n.reflow()}),c.$on("$destroy",function(){if(n){try{n.destroy()}catch(a){}b(function(){f.remove()},0)}})}}}angular.module("highcharts-ng",[]).factory("highchartsNGUtils",a).directive("highchart",["highchartsNGUtils","$timeout",b])}();