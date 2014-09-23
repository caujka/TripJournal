import json
import datetime
import math

from django.shortcuts import render, redirect, get_object_or_404
from django.core.context_processors import csrf
from django.http import HttpResponse
from django.contrib import messages, auth
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST

from trip_journal_app.models import Story, Picture, Map_artifact
from trip_journal_app.forms import UploadFileForm
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger


def home(request):
    """
    Home page view.
    """
    return render(
        request, 'index.html',
        {'stories': Story.objects.all(), 'user': auth.get_user(request)}
    )


@login_required
@require_POST
def save(request, story_id):
    """
    View for saving story contents. Responds only to ajax POST requests.
    """
    user = auth.get_user(request)
    if story_id:
        story = get_object_or_404(Story, pk=int(story_id))
        if user != story.user:
            return HttpResponse('Unauthorized', status=401)
    else:
        story = Story()
        story.user = auth.get_user(request)
        story.date_travel = datetime.datetime.now().date()
    request_body = json.loads(request.body)
    story.title = request_body['title']
    story.text = json.dumps(request_body['blocks'], ensure_ascii=False)
    story.date_publish = datetime.datetime.now()
    story.save()
    return HttpResponse(story.id)


@login_required
@require_POST
def upload_img(request, story_id):
    # authorization part
    story = get_object_or_404(Story, pk=int(story_id))
    user = auth.get_user(request)
    if user != story.user:
        return HttpResponse('Unauthorized', status=401)

    form = UploadFileForm(request.POST, request.FILES)
    if form.is_valid():
        img = request.FILES['file']
        pic = Picture.objects.create(story=story)
        pic.save_in_sizes(img)
        return HttpResponse(pic.id)
    else:
        return HttpResponse('Sorry, your data was invalid', status=400)


def story(request, story_id):
    return HttpResponse('You are reading story %s' % story_id)


@login_required
@ensure_csrf_cookie
def edit(request, story_id):
    '''
    Edit page view.
    '''
    # if story_id is empty rednders template without added text
    story_blocks = {}
    story = Story()
    # if story_id exists renders its content to edit.html page
    if story_id:
        try:
            user = auth.get_user(request)
            story = Story.objects.get(pk=int(story_id))
            if user != story.user:
                messages.info(request, 'Edit your own stories!')
                return redirect('/my_stories/')
            if story.text:
                hardcoded_img_size = 900
                story_blocks = (
                    story.get_text_with_pic_urls(hardcoded_img_size)
                )
        # if story_id doesn't exist redirects user to list of his/her stoires
        except Story.DoesNotExist:
            msg = ("Such a story doesn't exist. But you can create a new one.")
            messages.info(request, msg)
            return redirect('/my_stories/')
    context = {
        'story_blocks': story_blocks,
        'story': story,
    }
    return render(request, 'edit.html', context)


@login_required
def user_stories(request):
    """
    Shows list of user stories and link to create new story.
    """
    user = auth.get_user(request)
    if user:
        stories = Story.objects.filter(user=user)
        context = {'stories': stories}
        return render(request, 'my_stories.html', context)


@require_POST
def login(request):
    args = csrf(request)
    if request.method == 'POST':
        username = request.POST.get('username', '')
        password = request.POST.get('password', '')
        user = auth.authenticate(username=username, password=password)
        if user is not None:
            auth.login(request, user)
        else:
            messages.info(request, "User doesn't exist")
        # next page user goes to
        next_url = request.POST.get('next', '/')
        return redirect(next_url, args)


def logout(request):
    auth.logout(request)
    return redirect("/")

def show_story_near_by_page(request):
    """
    Search stories near by page 
    """
    return render(
        request, 'stories_near_by.html')

def search_story_near_by(request):
    stor = csrf(request)
    list_of_stories = []
    if request.method == 'GET':
        x = float(request.GET.get('latitude', ''))
        y = float(request.GET.get('longitude', ''))
        stories = Story.objects.all()
        for st in stories:
            coordinates = []
            distance = []
            pictures = Picture.objects.filter(story_id=st.id)
            artifacts = Map_artifact.objects.filter(story_id=st.id)
            for picture in pictures:
                if picture.latitude and picture.longitude:
                    coordinates.append([float(picture.latitude), float(picture.longitude)])
            for artifact in artifacts:
                if artifact.latitude and artifact.longitude:
                    coordinates.append([float(artifact.latitude), float(artifact.longitude)])
            for coordinate in coordinates:
                dist = math.sqrt((x - coordinate[0])**2 + (y - coordinate[1])**2)
                distance.append(dist)
            list_of_stories.append({'story': st, 'distance': min(distance)})
        list_of_stories.sort(key = lambda k: k['distance'])
        current_page = Paginator(list_of_stories['story'], 25)
        return render('/', current_page.page(), stor)
