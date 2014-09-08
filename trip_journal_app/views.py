import json
import os
from django.shortcuts import render, redirect
from django.http import HttpResponse
from TripJournal.settings import MEDIA_ROOT
from trip_journal_app.utils.json_utils import (
    saved_stories, unicode_slugify, load_story_info
)
from trip_journal_app.models import Story

# Create your views here.


def home(request):
    """
    Home page view.
    """
    return render(request, 'index.html', {'stories': stories})


def edit(request, story_name):
    '''
    Edit page view. When changes on the page are published
    saves added content to file in media directory.
    '''

    # POST requests for publishing
    if request.method == 'POST':
        request_body = json.loads(request.body)
        story_title_slug = unicode_slugify(request_body['title'])
        file_name = os.path.join(MEDIA_ROOT, story_title_slug + '.json')
        with open(file_name, 'w') as story_file:
            json.dump(request_body, story_file)
        return HttpResponse("ok")

    # GET requests
    elif request.method == 'GET':

        # for cases when there is no name or it's a new story
        story_info = {'title': story_name}
        if story_name:
            slugish_name = unicode_slugify(story_name)
            if slugish_name in saved_stories():

                # redirect to normal url
                if slugish_name != story_name:
                    return redirect('/edit/%s' % slugish_name)

                story_info = load_story_info(story_name)

        return render(request, 'edit.html', story_info)

