# -*- coding: utf-8 -*-
'''
This module creates testing data in real database.
The data then can be serialized using:

python manage.py dumpdata trip_journal_app --indent=4 >
trip_journal_app/fixtures/trip_journal.json
'''
from trip_journal_app.models import *
import datetime


def create_users():
    '''
    Two users for testing.
    '''
    User.objects.create(
        name='Sasha', oauth_service='fb', oauth_id='some_id'
    )
    User.objects.create(
        name='Olesia',
        oauth_service='google+',
        oauth_id='some_other_id')


def create_stories():
    '''
    Tree test stories.
    '''
    Story.objects.create(
        title='Сивуля',
        date_publish=datetime.datetime.now(),
        user=User.objects.get(name='Sasha'),
        text='{"content":[\
    { "type": "text",\
      "location": "",\
      "content": "Одного разу ми поїхали на Сивулю. По дорозі ми побачили річечку"},\
    { "type": "img",\
      "location": "",\
      "name": "1.JPG"},\
    { "type": "text",\
      "location": "",\
      "name": "І багато каменячок."},\
    { "type": "img",\
      "location": "",\
      "name": "2.JPG"},\
    { "type": "text",\
      "location": "",\
      "content": "І водоспадик."},\
    { "type": "img",\
      "location": "",\
      "name": "3.JPG"}\
    ]}',
        date_travel=datetime.date(2014, 7, 10),
        rating=3.0,
        published=True,
    )
    Story.objects.create(
        title='Порожня історія',
        date_publish=datetime.datetime.now(),
        user=User.objects.get(name='Olesia'),
        text='',
        date_travel=datetime.date(2010, 2, 2),
        rating=5.0,
        published=True,
    )
    Story.objects.create(
        title='Давня історія',
        date_publish=datetime.datetime(2009, 8, 7),
        user=User.objects.get(name='Olesia'),
        text='',
        date_travel=datetime.date(2009, 3, 2),
        rating=2.0,
        published=True,

    )


def create_pictures():
    Picture.objects.create(
        name='1.JPG', story=Story.objects.get(title='Сивуля')
    )
    Picture.objects.create(
        name='2.JPG', story=Story.objects.get(title='Сивуля')
    )
    Picture.objects.create(
        name='3.JPG', story=Story.objects.get(title='Сивуля')
    )


def create_stored_pictures():
    pics = [
        ('1.JPG', 240,
         'https://googledrive.com/host/0BzRzJOY4oY_BQ2RTTWEyX1JqNHc/1_240.JPG'
         ),
        ('1.JPG', 480,
         'https://googledrive.com/host/0BzRzJOY4oY_BQ2RTTWEyX1JqNHc/1_480.JPG'
         ),
        ('1.JPG', 960,
         'https://googledrive.com/host/0BzRzJOY4oY_BQ2RTTWEyX1JqNHc/1_960.JPG'
         ),
        ('1.JPG', 2304,
         'https://googledrive.com/host/0BzRzJOY4oY_BQ2RTTWEyX1JqNHc/1_orig.JPG'
         ),
        ('2.JPG', 320,
         'https://googledrive.com/host/0BzRzJOY4oY_BQ2RTTWEyX1JqNHc/2_320.JPG'
         ),
        ('2.JPG', 640,
         'https://googledrive.com/host/0BzRzJOY4oY_BQ2RTTWEyX1JqNHc/2_640.JPG'
         ),
        ('2.JPG', 1024,
         'https://googledrive.com/host/0BzRzJOY4oY_BQ2RTTWEyX1JqNHc/2_1024.JPG'
         ),
        ('2.JPG', 3072,
         'https://googledrive.com/host/0BzRzJOY4oY_BQ2RTTWEyX1JqNHc/2_orig.JPG'
         ),
        ('3.JPG', 320,
         'https://googledrive.com/host/0BzRzJOY4oY_BQ2RTTWEyX1JqNHc/3_320.JPG'
         ),
        ('3.JPG', 640,
         'https://googledrive.com/host/0BzRzJOY4oY_BQ2RTTWEyX1JqNHc/3_640.JPG'
         ),
        ('3.JPG', 1024,
         'https://googledrive.com/host/0BzRzJOY4oY_BQ2RTTWEyX1JqNHc/3_1024.JPG'
         ),
        ('3.JPG', 3072,
         'https://googledrive.com/host/0BzRzJOY4oY_BQ2RTTWEyX1JqNHc/3_orig.JPG'
         )
    ]
    [Stored_picture.objects.create(
        picture=Picture.objects.get(name=pic[0]),
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
        user=User.objects.get(name='Olesia'),
        story=Story.objects.get(title='Сивуля'),
    )
    Comment.objects.create(
        text='Напиши щось.',
        user=User.objects.get(name='Sasha'),
        story=Story.objects.get(title='Порожня історія')
    )


def init():
    create_users()
    create_stories()
    create_pictures()
    create_stored_pictures()
    create_tags()
    create_comments()

if __name__ == '__main__':
    init()
