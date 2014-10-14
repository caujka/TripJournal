from django import template

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


@register.filter(name='coordinates_data')
def coordinates_data(block):
    if block['marker']:
        return 'data-lat=%s data-lng=%s' % (
            block['marker']['lat'], block['marker']['lng']
        )
    return ''
