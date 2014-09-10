from django.conf.urls import url

from trip_journal_app import views


urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^edit/(?P<story_id>\d*)$', views.edit, name='edit'),
    # saving contents of story
    url(r'^save/(?P<story_id>\d*)$', views.save, name='save'),
    # image uploads
    url(r'^upload/(?P<story_id>\d+)$', views.upload_img, name='upload_img'),
    # view story
    url(r'^story/(?P<story_id>\d+)$', views.story, name='story'),
    # list of user stories
    url(r'^my_stories/$', views.user_stories, name='user_stories'),
]
