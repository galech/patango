'use strict';

angular.module("djangoPatango").component("values", {
  templateUrl: "templates/values.html",
  bindings: {values: '<', model: '<', annotations: "<"},
  controller: function nodeCtrl($scope, Utils) {

    var ctrl = this;
    ctrl.virtualValues = []
    ctrl.expandVirtualValue = function (virtualValue, newValue){
        if (Utils.isRelationField(newValue))  {
            virtualValue.path += "__" + newValue.name
            virtualValue.field = newValue
            virtualValue.options = calculateOptions(newValue.related_model, virtualValue.path)
        } else{
            ctrl.values.push(virtualValue.path+ "__" + newValue.name)
            _.remove(ctrl.virtualValues, virtualValue);
        }
    }

    ctrl.addValue = function (newValue){
        if (Utils.isRelationField(newValue)) {
            ctrl.virtualValues.push({
                path: newValue.name,
                field: newValue,
                options: calculateOptions(newValue.related_model, newValue.name)
            })
        }
        else {ctrl.values.push(newValue.name)}
    }

    var calculateOptions = function (model, prefix){
        // recalcular las opciones para cada nodo virtual cada vez que anado
        return  _.orderBy(_.filter(
            _.concat(
                _.filter(model.fields, f => {return !Utils.isRelationField(f) || Utils.isRelationFKField(f)}),
                _.map(ctrl.annotations, (a) => ({label: a.name, name: a.name, db_type: "Annotation"}))
            ),
            o => !ctrl.values.includes((prefix ? prefix + "__": "") + o.name)
        ), ["db_type", "label"]);
    }

    ctrl.$onInit = function() {
        ctrl.options = calculateOptions(ctrl.model)
        $scope.$watch(() => ctrl.annotations, () => ctrl.options = calculateOptions(ctrl.model), true);
        $scope.$watchCollection('$ctrl.values', () => ctrl.options = calculateOptions(ctrl.model));
    };

  },
});
