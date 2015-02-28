from django.conf.urls import patterns, include, url


from localization import views


urlpatterns = [
    url(r'^change_language_social/$', views.change_language_social_index),
    url(r'^change_language_social/(?P<url_redirect>[A-Za-z0-9_]*)/$',
        views.change_language_social),
    url(r'^change_language/$', views.change_language),
]
