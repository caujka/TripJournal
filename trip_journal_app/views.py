import json
import datetime
from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import messages
from trip_journal_app.models import Story, Picture
from trip_journal_app.forms import UploadFileForm

# Create your views here.


def home(request):
    """
    Home page view.
    """
    return render(request, 'index.html', {'stories': Story.objects.all()})


def save(request, story_id):
    try:
        story = Story.objects.get(pk=int(story_id))
        request_body = json.loads(request.body)
        story.title = request_body['title']
        story.text = json.dumps(request_body['blocks'], ensure_ascii=False)
        story.date_publish = datetime.datetime.now()
        story.save()
        return HttpResponse('ok')
    except Story.DoesNotExist:
        return HttpResponse("story doesn't exist")


def upload_img(request, story_id):
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            img = request.FILES['file']
            pic = Picture.objects.create(
                story=Story.objects.get(pk=int(story_id))
            )
            pic.save_in_sizes(img)
        return HttpResponseRedirect('/upload/%s' % story_id)
    form = UploadFileForm()
    return render(request, 'upload.html', {'form': form, 'story_id': story_id})


def story(request, story_id):
    return HttpResponse('You are reading story %s' % story_id)


def edit(request, story_id):
    '''
    Edit page view.
    '''
    # if story_id is empty rednders template without added text
    if not story_id:
        blocks = ''
    # if story_id exists renders its content to edit.html page
    else:
        try:
            story = Story.objects.get(pk=int(story_id))
            print story.text
        # if story_id doesn't exist redirects user to list of his/her stoires
        except Story.DoesNotExist:
            msg = ("You've been redirected here because you tried to edit "
                   "nonexisting story.")
            messages.info(request, msg)
            return redirect('/my_stories/')
    return render(request, 'edit.html')


def user_stories(request):
    """
    Shows list of user stories and link to create new story.
    """
    # user id hardcoded until we don't have users and sessions.
    harcoded_user_id = 14
    stories = Story.objects.filter(user=harcoded_user_id)
    context = {'stories': stories}
    return render(request, 'my_stories.html', context)
