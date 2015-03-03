from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'TripJournal.views.home', name='home'),
    url(r'^', include('trip_journal_app.urls')),
    url('', include('social.apps.django_app.urls', namespace='social')),
    url('', include('django.contrib.auth.urls', namespace='auth')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^localization/', include('localization.urls')),
)

