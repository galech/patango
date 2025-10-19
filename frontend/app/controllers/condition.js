'use strict';


angular.module("djangoPatango").component("newCondition", {
  templateUrl: "templates/condition.html",
  bindings: {path: '<', model: '<', filters: '<', annotations: "<"},
  controller: function conditionCtrl(Utils) {
    var ctrl = this;
    ctrl.$onInit = function () {
        console.log(ctrl.annotations, ctrl.path.split("__")[0])
        if (_.find(ctrl.annotations, {name: ctrl.path.split("__")[0]})){
            var annotation = _.find(ctrl.annotations, {name: ctrl.path.split("__")[0]})
            ctrl.field = {
                db_type: annotation.key === 'exists' ? "BooleanField" : "IntegerField" // TODO puede ser otro
            }
            ctrl.key = ""
            console.log("Eureka", _.find(ctrl.annotations, {name: ctrl.path.split("__")[0]}))
        } else {
            var path = [];
            const keys = ctrl.path.split("__");
            ctrl.key = ""
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                ctrl.model = path.length > 0 ? path[path.length - 1].related_model : ctrl.model;
                var newField = _.find(ctrl.model.fields, {name: key})
                // console.log(path, ctrl.model, newField, ctrl.key)
                if (newField) {
                    ctrl.field = newField
                    if (ctrl.field.related_model) {
                        ctrl.model = ctrl.field.related_model
                        path.push(ctrl.field)
                    } else {
                        ctrl.key = keys.slice(i + 1).join("__");
                        break
                    }
                } else {
                    ctrl.key = keys.slice(i).join("__");  // date__gte :)
                    break
                }
            }
        }
        console.log("sale", ctrl.key, ctrl.model, ctrl.path, ctrl.field)
      if (ctrl.key === 'in'){
        ctrl.choices = _.map(ctrl.field.choices, c => {return {label: c[1], value: c[0]}})
      }
      else if (ctrl.key === 'pk__in'){
        ctrl.choices = _.map(ctrl.model.choices, c => {return {label: c[1], value: c[0]}})
      }
      else if (ctrl.key === "isnull"){ctrl.inputType = "checkbox"}
      else if (["DateTimeField", "TimescaleDateTimeField", "DateField"].includes(ctrl.field.db_type)){ctrl.dateInput = true}
      else if (Utils.isNumeric(ctrl.field)){ctrl.inputType = "number"}
      else if (Utils.isTextual(ctrl.field)){ctrl.inputType = "text"}
      else if (Utils.isBoolean(ctrl.field)){ctrl.inputType = "checkbox"}
    }
  },
});

angular.module('djangoPatango').component('inputDateOnly', {
  bindings: {model: '=', required: '<?'},
  template: '<input type="date" ng-model="$ctrl.internalDate" ng-required="$ctrl.required" ng-change="$ctrl.onChange()"/>',
  controller: function() {
    var ctrl = this;
    ctrl.$onInit = function () {if (ctrl.model) {ctrl.internalDate = new Date(ctrl.model)}}
    ctrl.onChange = function() {
      if (ctrl.internalDate instanceof Date) {ctrl.model = ctrl.internalDate.toISOString().split('T')[0];
      } else if (typeof ctrl.internalDate === 'string') {ctrl.model = ctrl.internalDate.split('T')[0];
      } else { ctrl.model = null; }
    }
  }
});
