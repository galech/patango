'use strict';

angular.module("djangoPatango").component("annotations", {
  templateUrl: "templates/annotations.html",
  bindings: {annotations: '<', model: '<', availableQueries: "<"},
  controller: function nodeCtrl(Utils) {
    var ctrl = this;
    ctrl.virtualAnnotations = []
    ctrl.expandVirtualAnnotation = function (virtualAnnotation, newValue){
        if (newValue.key)  {
            ctrl.annotations.push({
                path: virtualAnnotation.path,
                key: newValue.key,
                filters: {},
                annotations: [],
                name: (virtualAnnotation.path+ "_" + newValue.key).replace(/__/g, "_"),
            })
            _.remove(ctrl.virtualAnnotations, virtualAnnotation);
        } else{
            virtualAnnotation.path += "__" + newValue.name
            virtualAnnotation.field = newValue
            // solo si tiene many to many, si es FK sin many to many no proponer
            // sum solo para los many o si ya ha habido many

            // if ($filter('filterNumberField')(field.related_model.fields).length > 0){
            //     options = _.concat(options, [
            //       {label: "sum", key: "__sum", value: {}, group:"Subquery"},
            //       {label: "min", key: "__min", value: {}, group:"Subquery"},
            //       {label: "max", key: "__max", value: {}, group:"Subquery"},
            //       {label: "avg", key: "__avg", value: {}, group:"Subquery"},
            //     ])
            // }
            // TODO sum, min, max no sense on oneToOne, limit choieces
            virtualAnnotation.options = _.concat(getModelAnnotations(newValue.related_model), [
                {label: "sum", key: "sum", value: {}, db_type:"Subquery"},
                {label: "min", key: "min", value: {}, db_type:"Subquery"},
                {label: "max", key: "max", value: {}, db_type:"Subquery"},
                {label: "avg", key: "avg", value: {}, db_type:"Subquery"},
                {label: "exists", key: "exists", value: {}, db_type:"Subquery"},
                {label: "count", key: "count", value: {}, db_type:"Subquery"},
            ])
        }
    }

    ctrl.addValue = function (newValue){
        ctrl.virtualAnnotations.push({
            path: newValue.name,
            field: newValue,
            options: _.concat(getModelAnnotations(newValue.related_model), [
                {label: "sum", key: "sum", value: {}, db_type:"Subquery"},
                {label: "min", key: "min", value: {}, db_type:"Subquery"},
                {label: "max", key: "max", value: {}, db_type:"Subquery"},
                {label: "avg", key: "avg", value: {}, db_type:"Subquery"},
                {label: "exists", key: "exists", value: {}, db_type:"Subquery"},
                {label: "count", key: "count", value: {}, db_type:"Subquery"},
            ])
        })
    }

    var getModelAnnotations = function(model){
        return _.orderBy(_.filter(model.fields, f => {return Utils.isRelationField(f)}), ["db_type", "label"])
    }

    ctrl.$onInit = function () {ctrl.options = getModelAnnotations(ctrl.model)}
  },
});

