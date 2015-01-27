import json
import datetime

from django.shortcuts import render, redirect, get_object_or_404
from django.core.urlresolvers import reverse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import HttpResponse
from django.contrib import auth
from django.contrib.auth.decorators import login_required
from django.contrib.sessions.backends.db import SessionStore
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.views.decorators.http import require_POST

from trip_journal_app.models import Story, Picture, Tag, Map_artifact

from trip_journal_app.forms import UploadFileForm
from trip_journal_app.utils.story_utils import story_contents

def home(request):
    """
    Home page view.
    """
    stories = Story.objects.filter(published=True)
    context = {'stories': stories, 'user': auth.get_user(request)}
    return render(request, 'index.html', context)


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
        for block in request_body['blocks']:
            if block["type"]=="img":
                if block["marker"]!=None:                
                    picture=Picture.objects.get(id=block["id"])
                    picture.latitude=block["marker"]["lat"]
                    picture.longitude=block["marker"]["lng"]
                    picture.save()
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
        return story_contents(request, story_id, 'story.html', 
                                check_published=True)
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
@ensure_csrf_cookie
def editVova(request, story_id):
    '''
    Edit page view.
    '''
    return story_contents(request, story_id, 'editVova.html', check_user=True)


@login_required
def user_stories(request):
    """
    Shows list of user stories and link to create new story.
    """
    user = auth.get_user(request)
    stories = Story.objects.filter(user=user)
    context = {'stories': stories}
    return render(request, 'my_stories.html', context)


def show_story_near_by_page(request):
    """
    Search stories near by page
    """
    return render(
        request, 'items_near_by.html', {'item_type': 'stories'})


def show_picture_near_by_page(request):
    """
    Search pictures near by page
    """
    return render(
        request, 'items_near_by.html', {'item_type': 'pictures'})


def search_items_near_by(request):
    if request.method == 'GET':
        x = float(request.GET.get('latitude', ''))
        y = float(request.GET.get('longitude', ''))
        sess = SessionStore()
        if request.GET.get('item_type','') == u'pictures':
            sess['items_list'] = {'item_type': 'pictures',
                                'items': Picture.get_sorted_picture_list(x, y)}
            sess.save()
        elif request.GET.get('item_type','') == u'stories':
            sess['items_list'] = {'item_type': 'stories',
                                'items': Story.get_sorted_stories_list(x, y)}
            sess.save()
        response = redirect('/pagination/')
        response.set_cookie('pagination', sess.session_key)
        return response


def make_paging_for_items_search(request):
    sess_key = request.COOKIES['pagination']
    sess = SessionStore(session_key=sess_key)
    list_of_items = sess['items_list']  
    if list_of_items['item_type'] == 'pictures':
        if not list_of_items['items']:
            messages.info(request, 'No items found')
            return redirect('/pictures_near_by/')
        else:
            paginator = Paginator(list_of_items['items'], 10)
    elif list_of_items['item_type'] == 'stories':
        if not list_of_items['items']:
            messages.info(request, 'No items found')
            return redirect('/stories_near_by/')
        else:
            paginator = Paginator(list_of_items['items'], 2)
    page = request.GET.get('page')
    try:
        items = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        items = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999), deliver last page of results.
        items = paginator.page(paginator.num_pages)
    return render(request, 'items_near_by.html', {'items_list': items,
                'item_type': list_of_items['item_type']})


@login_required
@require_POST
def like(request, item_id, item_to_like):
    item = get_object_or_404(
        globals()[item_to_like.capitalize()],
        pk=int(item_id)
    )
    user = auth.get_user(request)
    if item.is_liked_by(user):
        item.likes.remove(user)
    else:
        item.likes.add(user)
    item.save()
    return HttpResponse(item.likes_count())


@login_required
@require_POST
def delete(request, story_id):
    story = get_object_or_404(Story, pk=int(story_id))
    user = auth.get_user(request)
    if user != story.user:
        return HttpResponse('Unathorized', status=401)
    story.delete()
    return redirect(reverse('user_stories'))


def delete_story_tag(request):
    """
    Delete teg in story tags
    """
    print 'delete story igor 1', request
    if request.is_ajax():
        story_id = request.GET.get('Story_id')
        tag_poz = request.GET.get('Tag_position')
        print 'delete story igor 2', story_id, tag_poz
        story = Story.objects.get(pk=story_id)
        story.tags.all()[int(tag_poz)].delete()
        return HttpResponse(status=200)


def get_story_tags(request):
    """
    Get tags from story
    """
    if request.is_ajax():
        story_id = request.GET.get('Story_id')
        story = Story.objects.get(pk=story_id)
        return HttpResponse({','.join(str(x) for x in story.tags.all())})


@login_required
@require_POST
def put_tag(request):
    """
    Put curent tag to DB
    """
    if request.is_ajax():
        request_body = json.loads(request.body)
        tags = Tag.objects.filter(name=request_body['tag_name'])
        if not tags:
            tag = Tag()
            tag.name = request_body['tag_name']
            tag.save()
        else:
            tag = tags[0]
        story = Story.objects.get(pk = int(request_body['story_id']))
        story.tags.add(tag)
        story.save()
        return HttpResponse(status=200)


def show_authorization_page(request):
        return render(
        request, 'authorization_page.html')


def stories_by_user(request):
    stor = csrf(request)
    if request.method == 'GET':
        needed_user = str(request.GET.get('needed_user', ''))
        stories = []
        if needed_user:
            needed_user = User.objects.get(username=needed_user)
            stories = Story.objects.filter(user=needed_user)
        context = {'stories': stories}
        return render(request, 'stories_by_user.html', context)
        
