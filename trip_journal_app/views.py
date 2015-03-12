import json
import datetime
import string
import time

from random import choice

from django.core.mail import send_mail
from django.shortcuts import render, redirect, get_object_or_404
from django.core.urlresolvers import reverse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.contrib import auth
from django.contrib.auth.decorators import login_required
from django.contrib.sessions.backends.db import SessionStore
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.views.decorators.http import require_POST
from django.contrib.auth.models import User
from django.core.context_processors import csrf
from django.contrib.auth import authenticate, login
from trip_journal_app.models import Story, Picture, Tag, Map_artifact, \
    Subscriptions, Comment, UserNotify, Notification_ban, Confirmation_code
from trip_journal_app.forms import UploadFileForm
from trip_journal_app.utils.story_utils import story_contents
from TripJournal.settings import AUTH_BY_EMAIL
import TripJournal.local_settings as local_settings
from django.utils.translation import get_language_info
from django.utils.translation import activate
from django.utils import translation
from django.conf import settings as TripJournal_settings


def home(request):
    """
    Home page view.
    """
    stories = Story.objects.filter(published=True)
    context = {'stories': stories, 'user': auth.get_user(request)}
    return render(request, 'index.html', context)


@login_required
@require_POST
@csrf_exempt
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
            if block["type"] == "img":
                if block["marker"] != None:
                    picture = Picture.objects.get(id=block["id"])
                    picture.latitude = block["marker"]["lat"]
                    picture.longitude = block["marker"]["lng"]
                    picture.save()
        return HttpResponse(story.id)


@login_required
@require_POST
@csrf_exempt
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
@csrf_exempt
def upload_img(request, story_id):
    # authorization part
    story = get_object_or_404(Story, pk=int(story_id))
    user = auth.get_user(request)
    if user != story.user:
        return HttpResponse('Unauthorized', status=401)
    print '=' * 20
    print request.FILES
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


def my_news(request):
    """
    Shows a page with latest publications of my subscriptions
    """
    user = auth.get_user(request)
    user_subscriptions = Subscriptions.objects.filter(subscriber=user)
    exception = None
    stories = []

    if user_subscriptions:
        for subscription in user_subscriptions:
            for story in Story.objects.filter(user=subscription.subscription):
                stories.append(story)
        if not stories:
            exception = "No stories"
    else:
        exception = "You have no subscriptions"

    context = {'stories': stories, 'exception': exception}
    return render(request, 'my_news.html', context)


def search_items_near_by(request):
    if request.method == 'GET':
        x = float(request.GET.get('latitude', ''))
        y = float(request.GET.get('longitude', ''))
        sess = SessionStore()
        if request.GET.get('item_type', '') == u'pictures':
            sess['items_list'] = {'item_type': 'pictures',
                                  'items': Picture.get_sorted_picture_list(x, y)}
            sess.save()
        elif request.GET.get('item_type', '') == u'stories':
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
        item.notify(user=user)
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
    tags_data = []
    if request.is_ajax():
        story_id = request.GET.get('Story_id')
        story = Story.objects.get(pk=story_id)

        for tag in story.tags.all():
            tags_data.append({"name": str(tag), "datetime": str(
                tag.datetime)})

        return HttpResponse(json.dumps(tags_data))


@ensure_csrf_cookie
def get_story_content(request):
    """
    Get text from story
    """
    if request.is_ajax():
        story_id = request.GET.get('id')
        story = Story.objects.get(pk=int(story_id))
        user = story.user
        # pictures = Picture.objects.filter(story_id=int(story_id))
        user_stories = Story.objects.filter(user=user)
        pictures = Picture.objects.filter(story=user_stories)
        picture_dic = {}
        for picture in pictures:
            picture_dic[str(picture.id)] = str(picture.get_stored_pic_by_size(
                800))

        content = {"text": str(story.text), "title": str(story.title),
                   "datetime": str(story.date_publish),
                   "picture": picture_dic}

        return HttpResponse(json.dumps(content))
        # return HttpResponse(status=200)
    else:
        return HttpResponse("REQUEST ERROR")


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
        story = Story.objects.get(pk=int(request_body['story_id']))
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
        
@require_POST
@csrf_exempt
def log_in(request):
    SECONDS_IN_MINUTE = 60

    body = json.loads(request.body)
    email = body["mail"]
    code = body["code"]
    userLogin = body["login"]
    now = time.time()   
    try:
        user = User.objects.get(email=email)
        conf_code = Confirmation_code.objects.get(user_id=user.id)
    except:
        return HttpResponse("Problems with code or email.")
    if (code == conf_code.code):
        timeDiffInMinutes = (float(now)-float(conf_code.start_time))/SECONDS_IN_MINUTE
        if timeDiffInMinutes<AUTH_BY_EMAIL["codeExpirationTime"]:
            if user.username==AUTH_BY_EMAIL["emptyUserName"]:
                if userLogin and userLogin!=AUTH_BY_EMAIL["emptyUserName"]:
                    try:
                        user = User.objects.get(username=userLogin)
                        return HttpResponse("This login is already used.")
                    except:
                        user.username = userLogin
                        user.save()
                elif userLogin==AUTH_BY_EMAIL["emptyUserName"]:
                    return HttpResponse("This login is restricted.")
                else:
                    return HttpResponse("Please enter your login.")
            user.set_password(code)
            user.save()
            user = authenticate(username=user.username,password=code)
            login(request, user)
            return HttpResponse("ok")
        else:
            return HttpResponse("Your code is out of date.")
    elif conf_code.attempt < 3:
        conf_code.attempt += 1
        conf_code.save()
        return HttpResponse("Email and code doesn't match.")
    else:
        return HttpResponse("You need a new code.")


@csrf_exempt
@require_POST
def send_code(request):
    body = json.loads(request.body)
    email = body["mail"]
    try:
        user = User.objects.get(email=email)
    except:
        user = User.objects.create_user(username=AUTH_BY_EMAIL["emptyUserName"],email=email)
    code = generate_codeMsg()
    try:
        conf_code = Confirmation_code.objects.get(user_id=user.id)
    except:    
        conf_code = Confirmation_code()
        conf_code.user = user
    conf_code.code = code
    conf_code.attempt = 0
    conf_code.start_time = time.time()
    conf_code.save()
    msg = "Your confirmation code = {0}.\nIt will be avaliable only for {1} minutes".format(code, AUTH_BY_EMAIL["codeExpirationTime"])
    send_mail('Hello!', msg, local_settings.emailHostUser,
    [email])
    return HttpResponse("Code has been sent to your mail.")



def generate_codeMsg():
    digits = string.digits
    code = "".join(choice(digits) for _ in range(AUTH_BY_EMAIL["codeLength"]))
    return code


def check_connection(request):
    return HttpResponse(status=200)


def settings(request):
    args={}
    args.update(csrf(request))
    if request.user.is_authenticated():    
        args['user']=request.user
    current_language=get_language_info(request.LANGUAGE_CODE)
    args['current_language']=current_language
    another_language=[]
    for lang in TripJournal_settings.LANGUAGES:
        if lang[0] != request.LANGUAGE_CODE:
            another_language.append(get_language_info(lang[0]))
    args['another_language']=another_language
    return render(request, "settings.html", args)


def logout(request):
    auth.logout(request)
    request.session[translation.LANGUAGE_SESSION_KEY] =''
    return redirect('/')


@login_required
@require_POST
def make_subscription_or_unsubscribe(request, subscribe_on):
    user = auth.get_user(request)
    author = User.objects.get(id=int(subscribe_on))
    action = request.POST.get('action')

    if action == "subscribe":
        if not Subscriptions.objects.filter(subscriber=user.id,
                                            subscription=author.id):
            Subscriptions(subscriber=user, subscription=author).save()
        return HttpResponse(status=200)
    else:
        if Subscriptions.objects.filter(subscriber=user.id,
                                        subscription=author.id):
            Subscriptions.objects.filter(
                subscriber=user.id, subscription=author.id).delete()
        return HttpResponse(status=200)


def general_rss(request):
    date = datetime.datetime.now().date()
    yesterday = date - datetime.timedelta(days=1)
    stories = Story.objects.filter(date_publish__gt=yesterday).order_by("-date_publish")
    context = {'stories': stories, 'date': date}
    return render(request, 'rss.xml', context,
                  content_type="application/xhtml+xml")


@login_required
@ensure_csrf_cookie
def add_comment(request, story_id):
    """Add a new comment."""
    if request.POST["text"]:
        author = auth.get_user(request)
        comment = Comment(user_id=author.id,
                          story_id=story_id,
                          text=request.POST["text"])
        comment.save()
        comment.notify(story_id)
    return HttpResponseRedirect('/story/{id}'.format(id=story_id))


@login_required
def user_messages(request):
    user = auth.get_user(request)
    notifications = user.notifications.order_by('-timestamp')
    try:
        is_notified = not UserNotify.objects.get(user=user).notification_off
    except:
        is_notified = True
    context = {'user': user,
               'notifications': notifications,
               'is_notified': is_notified}
    return render(request, 'user_messages.html', context)


@login_required
def mark_as_read(request, notification_id, story_id):
    request.user.notifications.get(pk=notification_id).mark_as_read()
    return story(request, story_id)


@login_required
def mark_all_as_read(request):
    request.user.notifications.unread().mark_all_as_read()
    return HttpResponseRedirect('/user_messages/')


@login_required
def toggle_notifications(request):
    user = auth.get_user(request)
    try:
        is_notified = not UserNotify.objects.get(user=user).notification_off
    except:
        notify_off = UserNotify(user=user, notification_off=True)
        notify_off.save()
        return HttpResponseRedirect('/user_messages/')
    if is_notified:
        user_notify = UserNotify.objects.get(user=user, notification_off=True)
        user_notify.save()
    else:
        UserNotify.objects.get(user=user).delete()
    return HttpResponseRedirect('/user_messages/')


@login_required
def toggle_story_notifications(request, story_id):
    user = auth.get_user(request)
    if Notification_ban.objects.filter(user=user, banned_story_id=story_id).exists():
        Notification_ban.objects.filter(user=user, banned_story_id=story_id).delete()
    else:
        ban = Notification_ban(user=user, banned_story_id=story_id)
        ban.save()
    return HttpResponseRedirect('/story/{id}'.format(id=story_id))


@login_required
def get_pics_by_user(request):
    user = auth.get_user(request)
    user_stories = Story.objects.filter(user=user)
    pictures = Picture.objects.filter(story=user_stories)
    picture_list = []
    for picture in pictures:
        picture_list.append((str(picture.get_stored_pic_by_size(300)),
                            picture.id))
    content = {"pictures": picture_list}
    return HttpResponse(json.dumps(content))
