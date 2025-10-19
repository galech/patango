import json

import pandas as pd
from django.apps import apps
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .utils import annotate_queryset, handle_q_node, get_model_by_db_table


def angular_view(request):
    return render(
        request,
        'django_patango/index.html',
        context={
            "introspection_url": reverse('django_patango_introspection'),
            "post_url": reverse('django_patango_post'),
        }
    )


def extract_schemas(request):
    exclude_models = []
    models_dict = {}
    for model in (m for m in apps.get_models() if not m._meta.proxy and m._meta.db_table not in exclude_models):
        name = model._meta.db_table
        models_dict[name] = {"label": model.__name__, "group": model._meta.app_label, "db_table": name}
        if hasattr(model, "fk_choices"):
            models_dict[name]["choices"] = [(item.pk, getattr(item, model.fk_choices)) for item in model.objects.all()]

        models_dict[name]["fields"] = [
            {**{
                "db_type": field.__class__.__name__,
                "related_model": field.related_model._meta.db_table if field.related_model else None,
                "accessor_name": getattr(field, "get_accessor_name", lambda: None)(),
                "attname": getattr(field, "get_attname", lambda: None)(),
                "name": field.name,
                "label": getattr(field, "verbose_name", field.name),
                "blank": getattr(field, 'blank', None),
                "nullable": field.null or field.__class__.__name__ == "ManyToManyField",
                "related_name": field.field.name if hasattr(field, "field") else None  # ManyToManyRel and ManyToOneRel
            }, ** ({"choices": list(field.choices)} if getattr(field, 'choices', None) else {})}

            for field in model._meta.get_fields()
        ]
    return JsonResponse(models_dict)


@csrf_exempt
def post(request):

    data = json.loads(request.body)
    model = get_model_by_db_table(data["model"])
    annotated_queryset = annotate_queryset(data["annotations"], model, model.objects.all())
    filtered_queryset = annotated_queryset.filter(handle_q_node(data["filters"]))
    df = pd.DataFrame(filtered_queryset.values(*data["values"]).order_by(*data["values"]))
    return JsonResponse({"result": df.to_html(index=False, classes="table table-striped", border=0)})
