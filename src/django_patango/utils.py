import operator
from functools import reduce

from django.db.models import (Avg, Count, Exists, Max, Min, OuterRef, Q, Subquery, Sum)
from django.apps import apps
from django.db.models.functions import Coalesce

SUBQUERY_METHOD_DICT = {"min": Min, "max": Max, "avg": Avg, "sum": Sum, "count": Count, "exists": Exists}


def annotate_queryset(annotations, base_model, queryset):
    for annotation in annotations:
        path = []
        for key in annotation["path"].split("__"):
            path.append(find_field_by_name(path[-1].related_model if path else base_model, key))
        target_model = path[-1].related_model
        uid = annotation["name"]
        annotated_queryset = annotate_queryset(annotation["annotations"], target_model, target_model.objects.all())
        sub_queryset = annotated_queryset.filter(handle_q_node(annotation["filters"]))
        reversed_path = '__'.join(
            getattr(f.remote_field, 'related_name', getattr(f.remote_field, 'name'))
            for f in reversed(path)
            if not getattr(f, 'parent_link', False)  # for polymorphic models # TODO test
        )
        sub_queryset = sub_queryset.filter(**{f"{reversed_path}": OuterRef("pk")}).values(reversed_path)
        if annotation["key"] == "exists":
            queryset = queryset.annotate(**{f"{uid}": Exists(sub_queryset)})
        else:
            expression = annotation.get("column", "pk")
            field = find_field_by_name(target_model, expression)
            if annotation.get("column_coalesce") is not None:
                expression = Coalesce(expression, annotation["column_coalesce"], output_field=field)
            subquery = Subquery(sub_queryset.annotate(
                **{f"{uid}": SUBQUERY_METHOD_DICT[annotation["key"]](expression)}).values(uid)
            )
            if annotation.get("coalesce") is not None:
                subquery = Coalesce(subquery, annotation.get("coalesce"), output_field=field)
            queryset = queryset.annotate(**{f"{uid}": subquery})

    return queryset


def handle_q_node(filters, opt=operator.and_):
    clauses = []
    for query_key, query_value in filters.items():
        if query_key == "__or":
            clauses.append(handle_q_node(query_value, operator.or_))
        elif query_key == "__not":
            clauses.append(~handle_q_node(query_value))
        else:
            clauses.append(Q(**{f"{query_key}": query_value}))
    return reduce(opt, clauses, Q())


def get_model_by_db_table(db_table):
    try:
        return next(model for model in apps.get_models() if model._meta.db_table == db_table)
    except StopIteration:
        raise LookupError(f"No model found with db_table='{db_table}'")


def find_field_by_name(model, field_name):
    if field_name == "pk":  # for polymorphic models ;)
        return model._meta.pk
    try:
        return next(field for field in model._meta.get_fields() if field.name == field_name)
    except StopIteration:
        raise LookupError(f"No field found with name='{field_name}' for db_table='{model._meta.db_table}'")
