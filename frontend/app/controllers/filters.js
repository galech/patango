'use strict';


angular.module("djangoPatango").component("filters", {
  templateUrl: "templates/filters.html",
  bindings: {filters: '<', model: '<', annotations: "<"},
  controller: function nodeCtrl($scope, Utils) {
    var ctrl = this;
    ctrl.virtualFilters = []
    ctrl.expandVirtualValue = function (newFilter, virtualFilter){
        if ('key' in newFilter)  {
            ctrl.filters[(virtualFilter? virtualFilter.path : '') + newFilter.key] = newFilter.value
            if (virtualFilter){_.remove(ctrl.virtualFilters, virtualFilter)};
        } else{
            if (virtualFilter){
                virtualFilter.path += "__" + newFilter.name
                virtualFilter.field = newFilter
                virtualFilter.options = Utils.isRelationField(newFilter) ? calculateOptions(newFilter.related_model, newFilter, virtualFilter.path) : getFieldOptions(newFilter)
            } else {
                ctrl.virtualFilters.push({
                path: newFilter.name,
                field: newFilter,
                options: Utils.isRelationField(newFilter) ? calculateOptions(newFilter.related_model, newFilter, newFilter.name) : getFieldOptions(newFilter)
            })
            }
        }
    }

    var calculateOptions = function (model, field, prefix){
        // recalcular las opciones para cada nodo virtual cada vez que anado
        // Extraer DB_type de annotation path
        return  _.orderBy(_.filter(
            _.concat(
                model.fields,
                field ? [] : [{label: "or",  key: "__or", value: {}, db_type:"Expansion"}, {label: "not",  key: "__not", value: {}, db_type:"Expansion"}],
                field && field.nullable? [{label: "exists", key: "__isnull", value: false, db_type:"Condition"}] : [], // sentido solo si no es el primero?
                !field && model && model.choices && model.choices.length > 0 ? [{label: "in",  key: "pk__in", value: [], db_type:"Condition"}] : [],
                field && field.choices && field.choices.length > 0 ? [{label: "in",  key: "__in", value: [], db_type:"Condition"}] : [],
                field ? [] : _.map(ctrl.annotations, (a) => Utils.extractDBTypeForAnnotation(a))
            ),
            o => true,
            // o => !ctrl.filters.includes((prefix ? prefix + "__": "") + o.name) TODO, fitler cacota
        ), ["db_type", "label"]);
    }
    ctrl.$onInit = function() {
        ctrl.options = calculateOptions(ctrl.model)
        $scope.$watch(() => ctrl.annotations, () => ctrl.options = calculateOptions(ctrl.model), true);
        $scope.$watchCollection('$ctrl.filters', () => ctrl.options = calculateOptions(ctrl.model));
    };


    var getFieldOptions = function(field){
        var options = []
      if (Utils.isTextual(field)){
        options = _.concat(options, [
          {label: "=", key:"", value: ''},
          {label: "contains", key: "__contains", value: ''},
          {label: "icontains", key: "__icontains", value: ''},
          {label: "startswith", key: "__startswith",  value: ''},
          {label: "endswith", key: "__endswith", value: ''},
        ])
      }
      if (["DateTimeField", "TimescaleDateTimeField"].includes(field.db_type)){ // Hack __date by now waiting for input datetime working
        options = _.concat(options, [
          {label: "=", key: "__date", value: ''},
          {label: ">=", key: "__date__gte", value: ''},
          {label: ">", key: "__date__gt", value: ''},
          {label: "<", key: "__date__lt", value: ''},
          {label: "<=", key: "__date__lte", value: ''},
          {label: "range", key: "__date__range", value: []},
        ])
      }
      if (["DateField"].includes(field.db_type)){
        options = _.concat(options, [
          {label: "=", key: "", value: ''},
          {label: ">=", key: "__gte", value: ''},
          {label: ">", key: "__gt", value: ''},
          {label: "<", key: "__lt", value: ''},
          {label: "<=", key: "__lte", value: ''},
          {label: "range", key: "__range", value: []},
          // {label: "year =", input: "year", extra: {"function": "ExtractYear"}, lookup:"__exact"},
          // {label: "year >=", lookup: "__gte", input: "year", extra: {"function": "ExtractYear"}},
          // {label: "year >", lookup: "__gt", input: "year", extra: {"function": "ExtractYear"}},
          // {label: "year <", lookup: "__lt", input: "year", extra: {"function": "ExtractYear"}},
          // {label: "year <=", lookup: "__lte", input: "year", extra: {"function": "ExtractYear"}},
          // {label: "year range", lookup: "__range", input: "year_range", value: [1900, 2050], extra: {"function": "ExtractYear"}},
        ])
      }
      if (Utils.isNumeric(field)){
        options = _.concat(options, [
          {label: "=", key:"", value: ''},
          {label: ">=", key: "__gte", value: ''},
          {label: ">", key: "__gt", value: ''},
          {label: "<", key: "__lt", value: ''},
          {label: "<=", key: "__lte", value: ''},
          {label: "range", key: "__range", value: []},
        ])
      }
      if (Utils.isBoolean(field)){
        options.push({label: "is", key:"", value: true})
      }
      // if (["PointField"].includes(field.db_type)){
      //   options = _.concat(options, [
      //     {label: "distance <=", key: "__distance_lte", value: {}},
      //     {label: "distance >=", key: "__distance_gte", value: {}},
      //     {label: "distance >", key: "__distance_gt", value: {}},
      //     {label: "distance <", key: "__distance_lt", value: {}},
      //   ])
      // }
      if (field.nullable) {options.push({label: "exists", key: "__isnull", value: false, group:"Condition"})}
      if (field.choices && field.choices.length > 0) { options.push({label: "in",  key: "__in", value: [], group:"Condition"})}
      return _.orderBy(options, ["group", "label"])

  }


  },
});

