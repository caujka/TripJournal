import json
import datetime

from django.shortcuts import render, redirect, get_object_or_404
from django.core.context_processors import csrf
from django.http import HttpResponse
from django.contrib import messages, auth
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST

from trip_journal_app.models import Story, Picture
from trip_journal_app.forms import UploadFileForm
from trip_journal_app.utils.story_utils import story_contents


def home(request):
    """
    Home page view.
    """
    stories = []
    for story in Story.objects.all():
        if story.text:
            story_blocks = story.get_text_with_pic_urls(300)
            first_text = next(
                (block for block in story_blocks if block['type'] == 'text'),
                None
            )
            first_img = next(
                (block for block in story_blocks if block['type'] == 'img'),
                None
            )
            stories.append(
                {'story': story,
                 'text': first_text,
                 'img': first_img}
            )
    return render(
        request, 'index.html',
        {'stories': stories, 'user': auth.get_user(request)}
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
    return story_contents(request, story_id, 'story.html')


@login_required
@ensure_csrf_cookie
def edit(request, story_id):
    '''
    Edit page view.
    '''
    return story_contents(request, story_id, 'edit.html', check_user=True)


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

