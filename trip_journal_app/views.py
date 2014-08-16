import json
import os
from django.shortcuts import render
from django.http import HttpResponse
from TripJournal.settings import MEDIA_ROOT
print MEDIA_ROOT

# Create your views here.


def home(request):
    # dummy view for home page
    return HttpResponse('Welcome to TripJournal')


def edit(request):
    '''
    Edit page view. When changes on the page are published
    saves added content to file in media directory.
    '''
    if request.method == 'POST':
        request_body = json.loads(request.body)
        story_title = request_body['title']
        file_name = os.path.join(MEDIA_ROOT, story_title + '.json')
        with open(file_name, 'w') as fh:
            json.dump(request_body, fh)
        return HttpResponse("ok")
    return render(request, 'edit.html')

