import json
import datetime

from django.shortcuts import render, redirect, get_object_or_404
from django.core.context_processors import csrf
from django.core.urlresolvers import reverse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import HttpResponse, Http404
from django.contrib import auth
from django.contrib.auth.decorators import login_required
from django.contrib.sessions.backends.db import SessionStore
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST
from django.template.context import RequestContext
from django.core.exceptions import ObjectDoesNotExist

from trip_journal_app.models import Story, Picture
from trip_journal_app.forms import UploadFileForm
from trip_journal_app.utils.story_utils import story_contents


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
        request, 'items_near_by.html', {item_type: 'story'})


def show_picture_near_by_page(request):
    """
    Search pictures near by page
    """
    return render(
        request, 'items_near_by.html', {item_type: 'picture'})


def search_items_near_by(request):
    if request.method == 'GET':
        x = float(request.GET.get('latitude', ''))
        y = float(request.GET.get('longitude', ''))
        sess = SessionStore()
        if request.GET.get('item_type','') == 'picture':
            sess['items_list'] = Picture.get_sorted_picture_list(x, y)
            sess.save()
        elif request.GET.get('item_type','') == 'story':
            sess['items_list'] = Story.get_sorted_stories_list(x, y)
            sess.save()
        response = redirect('/pagination/')
        response.set_cookie('pagination', sess.session_key)
        return response


def make_paging_for_story_search(request):
    sess_key = request.COOKIES['pagination']
    sess = SessionStore(session_key=sess_key)
    list_of_items = sess['items_list']
    paginator = Paginator(list_of_items, 1)
    page = request.GET.get('page')
    try:
        items = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        items = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999), deliver last page of results.
        items = paginator.page(paginator.num_pages)
    return render(request, 'items_near_by.html', {'items_list': items})


@login_required
def addrating(request, story_id):
    story = get_object_or_404(Story, pk=int(story_id))
    user = auth.get_user(request)
    story.rating.add(user)
    story.save()
    return redirect('/story/' + str(story_id))


@login_required
def addrating_to_pictures(request):
    story_id = request.GET['story']
    picture_id = request.GET['picture']
    pic = get_object_or_404(Picture, pk=int(picture_id))
    user = auth.get_user(request)
    pic.likes.add(user)
    pic.save()
    return redirect('/story/' + str(story_id))
    # try:
    #     if picture_id in request.COOKIES:
    #         redirect('/story/' + str(story_id))
    #     else:
    #         picture = Picture.objects.get(pk=int(picture_id))
    #         picture.rating_picture += 1
    #         picture.save()
    #         response = redirect('/story/' + str(story_id))
    #         response.set_cookie(picture_id, 'like_picture')
    #         return response
    # except ObjectDoesNotExist:
    #     raise Http404
    #return redirect('/story/' + str(story_id))


@login_required
@require_POST
def delete(request, story_id):
    story = get_object_or_404(Story, pk=int(story_id))
    user = auth.get_user(request)
    if user != story.user:
        return HttpResponse('Unathorized', status=401)
    story.delete()
    return redirect(reverse('user_stories'))

