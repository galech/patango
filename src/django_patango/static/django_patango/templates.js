(function(module) {
try {
  module = angular.module('djangoPatango.templates');
} catch (e) {
  module = angular.module('djangoPatango.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/annotations.html',
    '<subquery subquery="annotation" base-model="$ctrl.model" available-queries="$ctrl.availableQueries" ng-repeat="annotation in $ctrl.annotations"></subquery><span ng-repeat="virtualAnnotation in $ctrl.virtualAnnotations" style="display: flex; flex-direction: row; gap: 5px; align-items: center; margin-bottom:40px">{{ virtualAnnotation.path }} <select class="form-control" ng-change="$ctrl.expandVirtualAnnotation(virtualAnnotation, _); _=null" ng-model="_" ng-options="f as f.label group by f.db_type for f in virtualAnnotation.options"><option value="" disabled="disabled" selected="selected" hidden>{{::\'Add value\' | translate}}</option></select> </span><select class="form-control" ng-change="$ctrl.addValue(_); _=null" ng-model="_" ng-options="f as f.label group by f.db_type for f in $ctrl.options"><option value="" disabled="disabled" selected="selected" hidden>{{::\'Add annotation\' | translate}}</option></select>');
}]);
})();

(function(module) {
try {
  module = angular.module('djangoPatango.templates');
} catch (e) {
  module = angular.module('djangoPatango.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/condition.html',
    '<span ng-if="$ctrl.inputType"><span ng-if="$ctrl.key.endsWith(\'range\')">[<input ng-attr-type="{{$ctrl.inputType}}" required ng-model="$ctrl.filters[$ctrl.path][0]"> <input ng-attr-type="{{$ctrl.inputType}}" required ng-model="$ctrl.filters[$ctrl.path][1]">] </span><input ng-if="!$ctrl.key.endsWith(\'range\')" ng-attr-type="{{$ctrl.inputType}}" ng-required="$ctrl.inputType !== \'checkbox\'" ng-model="$ctrl.filters[$ctrl.path]"> </span><span ng-if="$ctrl.dateInput"><span ng-if="$ctrl.key.endsWith(\'range\')">[<input-date-only model="$ctrl.filters[$ctrl.path][0]" required="true"></input-date-only><input-date-only model="$ctrl.filters[$ctrl.path][1]" required="true"></input-date-only>]</span><input-date-only ng-if="!$ctrl.key.endsWith(\'range\')" model="$ctrl.filters[$ctrl.path]" required="true"></input-date-only></span><span ng-if="$ctrl.choices"><ui-select class="multi-choices" ng-if="::$ctrl.choices.length > 0" ng-required="true" multiple="multiple" theme="bootstrap" ng-model="$ctrl.filters[$ctrl.path]"><ui-select-match placeholder="{{::\'Select condition\' | translate}}">{{$item.label}}</ui-select-match><ui-select-choices repeat="c.value as c in $ctrl.choices | filter: {\'label\':$select.search}"><span ng-bind-html="c.label"></span></ui-select-choices></ui-select></span>');
}]);
})();

(function(module) {
try {
  module = angular.module('djangoPatango.templates');
} catch (e) {
  module = angular.module('djangoPatango.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/filters.html',
    '<span ng-repeat="(key, value)  in $ctrl.filters" style="display: flex; flex-direction: row; gap: 10px; align-items: center; margin-bottom: 10px">{{ key }} :<filters ng-if="key === \'__or\' || key === \'__not\'" filters="value" model="$ctrl.model" annotations="$ctrl.annotations"></filters><new-condition ng-if="key !== \'__not\' && key !== \'__or\'" filters="$ctrl.filters" path="key" model="$ctrl.model" annotations="$ctrl.annotations"></new-condition></span><span ng-repeat="virtualValue in $ctrl.virtualFilters" style="display: flex; flex-direction: row; gap: 10px; align-items: center; margin-bottom: 10px">{{ virtualValue.path }} <select class="form-control" ng-change="$ctrl.expandVirtualValue(_, virtualValue); _=null" ng-model="_" ng-options="f as f.label group by f.db_type for f in virtualValue.options"><option value="" disabled="disabled" selected="selected" hidden>{{::\'Add value\' | translate}}</option></select> </span><select class="form-control" ng-change="$ctrl.expandVirtualValue(_); _=null" ng-model="_" ng-options="f as f.label group by f.db_type for f in $ctrl.options"><option value="" disabled="disabled" selected="selected" hidden>{{::\'Add filter\' | translate}}</option></select>');
}]);
})();

(function(module) {
try {
  module = angular.module('djangoPatango.templates');
} catch (e) {
  module = angular.module('djangoPatango.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/query-builder.html',
    '<!DOCTYPE html><div style="height: 100%; line-height: 28px; margin-top:50px"><div ng-form="$ctrl.queryForm" class="form-horizontal col-sm-12"><div class="form-group col-sm-12"><label class="col-sm-2 col-form-label text-right">Model:</label><div class="col-sm-10" style="display: flex; align-items: center; gap: 5px"><ui-select append-to-body="true" theme="bootstrap" on-select="$ctrl.newQuery($item);" ng-model="selectedQuery"><ui-select-match placeholder="{{::\'New query\' | translate}}">{{$select.selected.label}}</ui-select-match><ui-select-choices group-by="\'group\'" repeat="query in $ctrl.availableQueries | orderBy: [\'label\'] |  filter: {label: $select.search}"><span ng-bind-html="query.label"></span></ui-select-choices></ui-select><button class="btn btn-secondary btn-sm" ng-click="$ctrl.importQuery($ctrl.jsonText)">Import Json</button></div></div><div ng-if="$ctrl.query.filters" class="form-group col-sm-12"><label class="col-sm-2 col-form-label text-right">Annotations:</label><annotations class="col-sm-10" annotations="$ctrl.query.annotations" available-queries="$ctrl.availableQueries" model="$ctrl.model"></annotations></div><div ng-if="$ctrl.query.filters" class="form-group col-sm-12"><label class="col-sm-2 col-form-label text-right">Filters:</label><filters class="col-sm-10" filters="$ctrl.query.filters" model="$ctrl.model" annotations="$ctrl.query.annotations"></filters></div><div ng-if="$ctrl.query.filters" class="form-group col-sm-12"><label class="col-sm-2 col-form-label text-right">Values:</label><values class="col-sm-10" annotations="$ctrl.query.annotations" values="$ctrl.query.values" model="$ctrl.model"></values></div><div ng-if="$ctrl.query.filters" class="form-group col-sm-12"><label class="col-sm-2 col-form-label text-right">Preview:</label><div class="col-sm-10"><pre>{{ $ctrl.query | json }}</pre></div></div><div ng-if="$ctrl.query.filters" class="form-group col-sm-12"><div class="col-sm-10 col-sm-offset-2"><button ng-disabled="$ctrl.queryForm.$invalid" ng-click="$ctrl.getQuery(\'html\')" class="btn btn-success">Run</button> <button ng-disabled="$ctrl.queryForm.$invalid" ng-click="$ctrl.getQuery(\'csv\')" class="btn btn-info">Csv</button></div></div><div ng-if="$ctrl.result" class="form-group col-sm-12"><div class="col-sm-10 col-sm-offset-2" ng-bind-html="$ctrl.result" style="overflow-x:scroll"></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('djangoPatango.templates');
} catch (e) {
  module = angular.module('djangoPatango.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/subquery.html',
    '<div style="display: flex; flex-direction: row; gap: 10px; align-items: center; margin-bottom: 40px" ng-if="::$ctrl.model"><div class="form-horizontal col-sm-12"><div class="form-group form-inline"><label class="pull-left col-form-label text-right">Annotate as:</label><div class="col-sm-10"><input class="form-control" type="text" ng-model="$ctrl.subquery.name" required ng-pattern="/^(?!.*__)[A-Za-z_][A-Za-z0-9_]*$/"><!-- Avoid __ ;) --></div></div><div class="form-group form-inline"><label class="pull-left col-form-label text-right">Model:</label><div class="col-sm-10" style="display: flex; flex-direction: row; gap: 10px; align-items: center;"><label class="col-form-label text-right">{{ $ctrl.subquery.path }}</label> <label class="col-form-label text-right">Function:</label> <input type="text" ng-value="$ctrl.subquery.key" readonly="readonly" class="form-control"> <label ng-if="$ctrl.subquery.key !== \'exists\' && $ctrl.field.nullable" class="col-form-label text-right">Default (coalesce):</label> <input ng-if="$ctrl.subquery.key !== \'exists\' && $ctrl.field.nullable" class="form-control" type="number" ng-model="$ctrl.subquery.coalesce"></div></div><div class="form-group form-inline" ng-if="$ctrl.subquery.key !== \'exists\' && $ctrl.subquery.key !== \'count\'"><label class="pull-left col-form-label text-right">On field:</label><div class="col-sm-10" style="display: flex; flex-direction: row; gap: 10px; align-items: center;"><select class="form-control" required ng-model="$ctrl.subquery.column" ng-options="f.name as f.label.toLowerCase() for f in $ctrl.model.fields | filterNumberField "><option value="" disabled="disabled" selected="selected" hidden>{{::\'Select column\' | translate}}</option></select> <label ng-if="$ctrl.getFieldByName($ctrl.subquery.column).nullable" class="col-form-label text-right">Default (coalesce):</label> <input ng-if="$ctrl.getFieldByName($ctrl.subquery.column).nullable" class="form-control" type="number" ng-model="$ctrl.subquery.column_coalesce"></div></div><div class="form-group form-inline"><label class="pull-left col-form-label text-right">Annotations:</label><annotations class="col-sm-10" annotations="$ctrl.subquery.annotations" model="$ctrl.model"></annotations></div><div class="form-group form-inline"><label class="pull-left col-form-label text-right">Filters:</label><filters class="col-sm-10" annotations="$ctrl.subquery.annotations" filters="$ctrl.subquery.filters" model="$ctrl.model"></filters></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('djangoPatango.templates');
} catch (e) {
  module = angular.module('djangoPatango.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/values.html',
    '<span ng-repeat="value in $ctrl.values" style="display: flex; flex-direction: column; gap: 5px;">{{ value }}</span> <span ng-repeat="virtualValue in $ctrl.virtualValues" style="display: flex; flex-direction: row; gap: 5px; align-items: center;">{{ virtualValue.path }} <select ng-change="$ctrl.expandVirtualValue(virtualValue, _); _=null" ng-model="_" ng-options="f as f.label group by f.db_type for f in virtualValue.options"><option value="" disabled="disabled" selected="selected" hidden>{{::\'Add value\' | translate}}</option></select> </span><select class="form-control" ng-change="$ctrl.addValue(_); _=null" ng-model="_" ng-options="f as f.label group by f.db_type for f in $ctrl.options"><option value="" disabled="disabled" selected="selected" hidden>{{::\'Add value\' | translate}}</option></select>');
}]);
})();
