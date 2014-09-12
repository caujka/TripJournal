import json
import datetime
from django.shortcuts import render, redirect, render_to_response
from django.http import HttpResponse
from django.contrib import messages
from django.views.decorators.csrf import ensure_csrf_cookie
from trip_journal_app.models import Story, Picture
from trip_journal_app.forms import UploadFileForm
from django.contrib import auth
from django.core.context_processors import csrf


def home(request):
    """
    Home page view.
    """
    return render(
        request, 'index.html',
        {'stories': Story.objects.all(), 'user': auth.get_user(request)}
    )


def save(request, story_id):
    if story_id:
        try:
            story = Story.objects.get(pk=int(story_id))
        except Story.DoesNotExist:
            return HttpResponse("story doesn't exist")
    else:
        story = Story()
        # some dafault values util we will have real users.
        # it's suppoesed that trip_journal fixture is installed.
        story.user = User.objects.get(pk=14)
        story.date_travel = datetime.datetime.now().date()
    request_body = json.loads(request.body)
    story.title = request_body['title']
    story.text = json.dumps(request_body['blocks'], ensure_ascii=False)
    story.date_publish = datetime.datetime.now()
    story.save()
    return HttpResponse(story.id)


def upload_img(request, story_id):
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            img = request.FILES['file']
            pic = Picture.objects.create(
                story=Story.objects.get(pk=int(story_id))
            )
            pic.save_in_sizes(img)
            return HttpResponse(pic.id)
        else:
            return HttpResponse('Sorry, your data was invalid')


def story(request, story_id):
    return HttpResponse('You are reading story %s' % story_id)


@ensure_csrf_cookie
def edit(request, story_id):
    '''
    Edit page view.
    '''
    # if story_id is empty rednders template without added text
    if not story_id:
        story_blocks = ''
    # if story_id exists renders its content to edit.html page
    else:
        try:
            story = Story.objects.get(pk=int(story_id))
            story_blocks = {}
            if story.text:
                hardcoded_img_size = 900
                story_blocks = (
                    story.get_text_with_pic_urls(hardcoded_img_size)
                )
        # if story_id doesn't exist redirects user to list of his/her stoires
        except Story.DoesNotExist:
            msg = ("You've been redirected here because you tried to edit "
                   "nonexisting story.")
            messages.info(request, msg)
            return redirect('/my_stories/')
    context = {'story_blocks': story_blocks}
    return render(request, 'edit.html', context)


def user_stories(request):
    """
    Shows list of user stories and link to create new story.
    """
    # user id hardcoded until we don't have real users and sessions.
    harcoded_user_id = 14
    stories = Story.objects.filter(user=harcoded_user_id)
    context = {'stories': stories}
    return render(request, 'my_stories.html', context)


def login(request):
    args = csrf(request)
    if request.method == 'POST':
        username = request.POST.get('username', '')
        password = request.POST.get('password', '')
        user = auth.authenticate(username=username, password=password)
        if user is not None:
            auth.login(request, user)
            return redirect('/', args)
        else:
            messages.info(request, "User doesn't exist")
            return redirect('/', args)
    else:
        return render_to_response('index.html', args)


def logout(request):
    auth.logout(request)
    return redirect("/")
