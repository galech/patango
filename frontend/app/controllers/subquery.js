'use strict';

angular.module("djangoPatango").component("subquery", {
  templateUrl: "templates/subquery.html",
  bindings: {subquery: '<', availableQueries: "<", baseModel: "<"},
  controller: function subqueryCtrl($rootScope, $q, Utils) {
    var ctrl = this;
    ctrl.getFieldByName = function(columnName){ return _.find(ctrl.model.fields, {name:columnName})}
    ctrl.$onInit = function () {
        var path = [];
        for (const key of ctrl.subquery.path.split("__")) {
            const currentModel = path.length > 0 ? path[path.length - 1].related_model : ctrl.baseModel;
            ctrl.field = _.find(currentModel.fields, {name: key})
            ctrl.model =  ctrl.field .related_model
            path.push(ctrl.field);
        }
    }
  },
});
