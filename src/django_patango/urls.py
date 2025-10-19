from django.urls import path

from django_patango.views import angular_view, extract_schemas, post


urlpatterns = [
    path('', angular_view, name='django_patango_main'),
    path('introspection', extract_schemas, name='django_patango_introspection'),
    path('post', post, name='django_patango_post'),

]