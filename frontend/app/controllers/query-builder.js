'use strict';


angular.module("djangoPatango").component("queryBuilder", {
  templateUrl: "templates/query-builder.html",
  bindings: {introspectionUrl: "@", postUrl: "@"},
  controller: function queryBuilderCtrl($timeout, $q, $filter, $http, $scope, Utils, $window) {
    var ctrl = this
    ctrl.jsonText = ""
    ctrl.newQuery = function (query) {
      ctrl.query = null
      ctrl.result = null
      $timeout(function () {
        ctrl.model = query; ctrl.query = {model: query.db_table, filters: {}, values: [], annotations: [],}
      })
    }
    ctrl.importQuery = function (queryStr){


      if (navigator.clipboard && navigator.clipboard.readText) {
        ctrl.query = null
        navigator.clipboard.readText()
          .then(text => {
              var parsedJson = JSON.parse(text);
              ctrl.result = null
              $timeout(function () {
                ctrl.model = _.find(ctrl.availableQueries, {db_table: parsedJson.model})
                ctrl.query = parsedJson
                ctrl.jsonText = ""
              }, 50)
          })
          .catch(err => {
            $window.alert("No se pudo leer del portapapeles 😢");
          });
      } else {
        $window.alert("Tu navegador no soporta la API del portapapeles");
      }

    }

    ctrl.getQuery = function (resultType) {
      ctrl.result = null
      ctrl.resultType = resultType
      $http.post(ctrl.postUrl, _.assign({resultType: resultType}, ctrl.query)).then(function (response) {
        ctrl.result = response.data.result
      })
    }

    ctrl.$onInit = function () {
      $q.when(Utils.fetchAvailableQueries(ctrl.introspectionUrl)).then((availableQueries) => {
        ctrl.availableQueries = availableQueries
      })
    };
  },
});
