from django.conf.urls import url

from trip_journal_app import views


urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^edit/(?P<story_id>[\d+])$', views.edit, name='edit'),
    url(r'^save/(?P<story_id>[\d+])$', views.save, name='save'),
    url(r'^story/(?P<story_id>[\d+])$', views.story, name='story'),
]
