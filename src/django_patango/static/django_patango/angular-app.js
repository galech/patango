angular.module('djangoPatango', ['ui.select', 'ngSanitize', 'djangoPatango.templates', 'pascalprecht.translate', 'dndLists']);


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

'use strict';


angular.module("djangoPatango").factory('Utils', function ($q, $http, $filter) {
  var supportedFields = [
    // "PointField",
    "TimescaleDateTimeField",
    "BooleanField",
    "CharField",
    "EmailField",
    "DateField",
    "DateTimeField",
    "IntegerField",
    "BigAutoField",
    "AutoField",
    "FloatField",
    "DecimalField",
    "ForeignKey",
    "OneToOneField",
    "ManyToManyField",
    "ManyToManyRel",
    "OneToOneRel",
    "ManyToOneRel",
    // "DurationField",
    // "JSONField",
  ]

  var isRelationField = function(field){
    return field.related_model
//    return ["ForeignKey", "OneToOneField", "ManyToManyField", "ManyToManyRel", "OneToOneRel", "ManyToOneRel"].includes(field.db_type)
  }
  var isRelationFKField = function(field){ // TODO rename
    return ["ForeignKey", "OneToOneField", "OneToOneRel"].includes(field.db_type)
  }

  var isBoolean = function(field){
    return ["BooleanField"].includes(field.db_type)
  }

  var isNumeric = function(field){
    return ["IntegerField", "AutoField", "FloatField", "BigAutoField", "DecimalField"].includes(field.db_type)
  }

  var isTextual = function(field){
    return ["CharField", "EmailField"].includes(field.db_type)
  }

  var fetchAvailableQueries = async function (introspectionUrl) {
    return $http.get(introspectionUrl).then(function (availableQueriesResponse) {
      var availableQueries = availableQueriesResponse.data
      _.forEach(_.keys(availableQueries), function (key) {  // Sanitize
        availableQueries[key].fields = _.orderBy(_.filter(availableQueries[key].fields, function (field) {
          return (!field.related_model || (field.related_model in availableQueries)) && supportedFields.includes(field.db_type)
        }), "label")
      })
      return _.flatMap(availableQueries, query => {
        _.forEach(_.filter(query.fields, "related_model"), relationField => {
          relationField.related_model = availableQueries[relationField.related_model]
          relationField.choices = relationField.related_model.choices
        })
        return query
      })
    })
  }
  var extractDBTypeForAnnotation = function extractDBTypeForAnnotation(annotation){
      var db_type = annotation.key === "count" ? "IntegerField" : (annotation.key === "exists" ? "BooleanField": "IntegerField")  // TODO las interger can be float decimal etc
      return {
          label: annotation.name,
          name: annotation.name,
          db_type: db_type}

  }

  return {
    fetchAvailableQueries: fetchAvailableQueries,
    isNumeric: isNumeric,
    isTextual: isTextual,
    isBoolean: isBoolean,
    isRelationField: isRelationField,
    isRelationFKField: isRelationFKField,
    extractDBTypeForAnnotation: extractDBTypeForAnnotation,
  }
});

angular.module('djangoPatango').filter('jsonPretty', function() {
  return function(obj) {return JSON.stringify(obj, null, 4);};
});

angular.module('djangoPatango').filter('filterNumberField', function (Utils) {
  return function (fields) {
    return _.filter(fields, function (field) {return Utils.isNumeric(field)})
  };
});

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
