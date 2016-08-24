from django.conf.urls import url
from django.contrib import admin

from . import views

app_name = 'deobfuscate'
urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'^results/$', views.results, name='results'),
    url(r'^get_js/$', views.get_js, name='get_js'),
]