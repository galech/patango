# django_patango

`django_patango` is a Django library that allows **dynamic queries and annotations** on your models via JSON. The results can be returned as **HTML tables** ready to display on your frontend.

## 🚀 Installation

Install the package via `pip`:

pip install django-patango

Add it to your `INSTALLED_APPS` in `settings.py`:

INSTALLED_APPS = [
    ...
    'django_patango',
]

Include the library’s URLs in your project `urls.py`:

from django.urls import path, include

urlpatterns = [
    ...
    path('patango/', include('django_patango.urls')),
]

## ⚡ Features

- Interactive frontend query builder at `/patango`.
