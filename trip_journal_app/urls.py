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
    url(r'^story/(?P<story_id>\d*)$', views.story, name='story'),
    # list of user stories
    url(r'^my_stories/$', views.user_stories, name='user_stories'),
    # add likes to stories and pictures
    url(r'^(?P<item_to_like>story|picture)/like/(?P<item_id>\d+)/$',
        views.like, name='like'),
    # list of near by pictures
    url(r'^pictures_near_by/$', views.show_picture_near_by_page,
        name='pictures_near_by'),
    # list of nearby stories
    url(r'^stories_near_by/$', views.show_story_near_by_page,
        name='stories_near_by'),
    url(r'^search_items_near_by/', views.search_items_near_by,
        name='search_items_near_by'),
    url(r'^$', views.home, name='home'),
    # list of stories by needed user
    url(r'^stories_by_user/$', views.stories_by_user, name='stories_by_user'),
    # toggling publish state for story
    url(r'^publish/(?P<story_id>\d+)$', views.publish, name='publish'),
    url(r'^delete/(?P<story_id>\d+)$', views.delete, name='delete'),
    url(r'^pagination/', views.make_paging_for_items_search,
        name='make_paging_for_items_search'),
    # get all tags
    url(r'^get_story_tags/$', views.get_story_tags, name='get_tag'),
    # put teg to DB
    url(r'^put_tag/$', views.put_tag, name='put_tag'),
    # delete tag in DB
    url(r'^delete_story_tag/$', views.delete_story_tag, name='delete_tag'),
    url(r'^authorization_page/', views.show_authorization_page, 
        name='show_authorization_page'),
    url(r'^send_code/$', views.send_code, name='send_code'),
    url(r'^log_in/$', views.log_in, name='log_in'),
]

