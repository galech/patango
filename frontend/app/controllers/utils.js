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
