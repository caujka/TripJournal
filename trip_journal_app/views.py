import json
import os
from django.shortcuts import render
from django.http import HttpResponse
from TripJournal.settings import MEDIA_ROOT
from trip_journal_app.utils import saved_stories

# Create your views here.


def home(request):
    # dummy view for home page
    return render(request, 'index.html', {'stories': saved_stories()})


def edit(request, story_name):
    '''
    Edit page view. When changes on the page are published
    saves added content to file in media directory.
    '''

    # POST requests for publishing
    if request.method == 'POST':
        request_body = json.loads(request.body)
        story_title = request_body['title']
        file_name = os.path.join(MEDIA_ROOT, story_title + '.json')
        with open(file_name, 'w') as fh:
            json.dump(request_body, fh)
        return HttpResponse("ok")
    else:
        if story_name:
            if story_name in saved_stories():
                print "Such a story exists."
            else:
                print "New story"
        return render(request, 'edit.html')

