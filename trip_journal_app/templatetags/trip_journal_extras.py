from django import template

register = template.Library()


@register.filter(name='get_stored_pic_by_size')
def get_stored_pic_by_size(obj, size):
    return obj.get_stored_pic_by_size(size)
