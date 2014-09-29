import json
import datetime

from django.shortcuts import render, redirect, get_object_or_404
from django.core.context_processors import csrf
from django.http import HttpResponse
from django.contrib import auth
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST

from trip_journal_app.models import Story, Picture
from trip_journal_app.forms import UploadFileForm
from trip_journal_app.utils.story_utils import story_contents
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from django.template.context import RequestContext

from django.contrib.sessions.backends.db import SessionStore


def home(request):
    """
    Home page view.
    """
    context = RequestContext(request,
                           {'request': request,
                            'user': request.user})
    stories = []
    for story in Story.objects.filter(published=True):
        if story.text:
            story_blocks = story.get_text_with_pic_objects()
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
        {'stories': stories, 'user': auth.get_user(request)}, context_instance=context
    )


@login_required
@require_POST
def save(request, story_id):
    """
    View for saving story contents. Responds only to ajax POST requests.
    """
    if request.is_ajax():
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
def publish(request, story_id):
    user = auth.get_user(request)
    story = get_object_or_404(Story, pk=int(story_id))
    if user != story.user:
        return HttpResponse('Unathorized', status=401)
    assert request.POST['publish'] in (u'True', u'False')
    story.published = (request.POST['publish'] == 'False')
    story.save()
    return redirect('/story/%s' % story_id)


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
    if story_id:
        return story_contents(request, story_id, 'story.html')
    else:
        return redirect('/')


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


def show_story_near_by_page(request):
    """
    Search stories near by page
    """
    return render(
        request, 'stories_near_by.html')


def search_story_near_by(request):
    stor = csrf(request)
    if request.method == 'GET':
        x = float(request.GET.get('latitude', ''))
        y = float(request.GET.get('longitude', ''))
        sess = SessionStore()
        sess['story_list'] = Story.get_sorted_story_list(x, y)
        sess.save()
        response = redirect('/pagination/')
        response.set_cookie('pagination', sess.session_key)
        return response

def make_paging_for_story_search(request):
    sess_key = request.COOKIES['pagination']
    sess = SessionStore(session_key=sess_key)
    list_of_stories = sess['story_list']
    paginator = Paginator(list_of_stories, 1)
    page = request.GET.get('page')
    try:
        stories = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        stories = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999), deliver last page of results.
        stories = paginator.page(paginator.num_pages)
    return render(request, 'stories_near_by.html', {'stories_list': stories})

