from django.conf.urls import url
from django.contrib import admin

from . import views

app_name = 'deobfuscate'
urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', views.get_js, name='get_js'),
    url(r'^about/$', views.about, name='about'),
    url(r'^team/$', views.team, name='team'),
    url(r'^results/$', views.results, name='results'),
    url(r'^get_js/$', views.get_js, name='get_js'),
]