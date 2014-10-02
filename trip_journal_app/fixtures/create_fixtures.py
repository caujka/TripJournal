# -*- coding: utf-8 -*-
'''
This module creates testing data in real database.
The data then can be serialized using:

python manage.py dumpdata trip_journal_app --indent=4 >
trip_journal_app/fixtures/trip_journal.json
'''
from trip_journal_app.models import *
from django.contrib.auth.models import User
import datetime


def create_users():
    '''
    Two users for testing.
    '''
    User.objects.create_user(
        'Sasha', 'sasha@gmail.com', 'sasha_password'
    )
    User.objects.create_user(
        'Olesia', 'olesia.hr@gmail.com', 'olesia_password'
    )


def create_stories():
    '''
    Tree test stories.
    '''
    story1 = Story.objects.create(
        title='Сивуля',
        date_publish=datetime.datetime.now(),
        user=User.objects.get(username='Sasha'),
        text='',
        date_travel=datetime.date(2014, 7, 10),
        rating=3.0,
        published=True,
    )
    Story.objects.create(
        title='Порожня історія',
        date_publish=datetime.datetime.now(),
        user=User.objects.get(username='Olesia'),
        text='',
        date_travel=datetime.date(2010, 2, 2),
        rating=5.0,
        published=True,
    )
    Story.objects.create(
        title='Давня історія',
        date_publish=datetime.datetime(2009, 8, 7),
        user=User.objects.get(username='Olesia'),
        text='',
        date_travel=datetime.date(2009, 3, 2),
        rating=2.0,
        published=True,
    )
    return story1.id


def create_pictures():
    pic1 = Picture.objects.create(
        story=Story.objects.get(title='Сивуля')
    )
    pic2 = Picture.objects.create(
        story=Story.objects.get(title='Сивуля')
    )
    pic3 = Picture.objects.create(
        story=Story.objects.get(title='Сивуля')
    )
    return [pic.id for pic in [pic1, pic2, pic3]]


def update_story_text(story_id, pic_ids):
    story = Story.objects.get(pk=story_id)
    story.text = ('[\
    { "type": "text",\
      "content": "Одного разу ми поїхали на Сивулю. По дорозі ми побачили річечку"},\
    { "type": "img",\
      "id": %i},\
    { "type": "text",\
      "content": "І багато каменячок."},\
    { "type": "img",\
      "id": %i},\
    { "type": "text",\
      "content": "І водоспадик."},\
    { "type": "img",\
      "id": %i}\
    ]' % tuple(pic_ids))
    story.save()


def create_stored_pictures(pic1, pic2, pic3):
    pics = [
        (pic1, 400, '1_400.jpg'),
        (pic1, 700, '1_700.jpg'),
        (pic1, 900, '1_900.jpg'),
        (pic1, 1500, '1_1500.jpg'),
        (pic1, 2304, '1_2304.jpg'),
        (pic2, 400, '2_400.jpg'),
        (pic2, 700, '2_700.jpg'),
        (pic2, 900, '2_900.jpg'),
        (pic2, 1500, '2_1500.jpg'),
        (pic2, 3072, '2_3072.jpg'),
        (pic3, 400, '3_400.jpg'),
        (pic3, 700, '3_700.jpg'),
        (pic3, 900, '3_900.jpg'),
        (pic3, 1500, '3_1500.jpg'),
        (pic3, 3072, '3_3072.JPG')
    ]
    [Stored_picture.objects.create(
        picture=Picture.objects.get(pk=pic[0]),
        size=pic[1],
        url=pic[2]
    ) for pic in pics]


def create_tags():
    tag = Tag.objects.create(name='empty story')
    stories = Story.objects.filter(text='')
    for story in stories:
        story.tags.add(tag)

    tag2 = Tag.objects.create(name='old story')
    Story.objects.get(title='Давня історія').tags.add(tag2)


def create_comments():
    Comment.objects.create(
        text='Я теж там була!',
        user=User.objects.get(username='Olesia'),
        story=Story.objects.get(title='Сивуля'),
    )
    Comment.objects.create(
        text='Напиши щось.',
        user=User.objects.get(username='Sasha'),
        story=Story.objects.get(title='Порожня історія')
    )


def init():
    create_users()
    stroy1_id = create_stories()
    pic_ids = create_pictures()
    update_story_text(stroy1_id, pic_ids)
    create_stored_pictures(*pic_ids)
    create_tags()
    create_comments()

if __name__ == '__main__':
    init()
