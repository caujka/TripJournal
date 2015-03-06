from django import template
from TripJournal import utils

register = template.Library()


@register.filter(name='get_stored_pic_by_size')
def get_stored_pic_by_size(obj, size):
    return obj.get_stored_pic_by_size(size)


@register.filter(name='is_liked_by')
def is_liked_by(obj, user):
    return obj.is_liked_by(user)


@register.filter(name='login_next')
def login_next(request):
    return request.GET.get('next', request.path)


@register.assignment_tag
def social_up(social):
    return utils.social_status[social]


@register.filter(name='coordinates_data')
def coordinates_data(block):
    if block['marker']:
        return 'data-lat=%s data-lng=%s' % (
            block['marker']['lat'], block['marker']['lng']
        )
    return ''

@register.filter(name='subscribed_or_not')
def subscribed_or_not(obj, author):
    return obj.subscribed_or_not(author)