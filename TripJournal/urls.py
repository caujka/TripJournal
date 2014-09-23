from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'TripJournal.views.home', name='home'),
    url(r'^', include('trip_journal_app.urls')),

    url(r'^admin/', include(admin.site.urls)),
)

