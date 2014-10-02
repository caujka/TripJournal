# -*- coding: utf-8 -*-
from django.test import TestCase
from mock import patch
from trip_journal_app.models import (
    User, Story, Picture, Stored_picture, Tag, Comment
)
from trip_journal_app.tests.stubs import (
    stub_get_stored_pic_by_size, stub_get_pictures_urls
)


class UserModelTest(TestCase):
    fixtures = ['trip_journal']

    def test_saving_and_retriving_users(self):
        saved_users = User.objects.all()
        self.assertEqual(saved_users.count(), 2)
        first_saved_user = saved_users[0]
        second_saved_user = saved_users[1]
        self.assertEqual(first_saved_user.username, 'Sasha')
        self.assertEqual(second_saved_user.username, 'Olesia')


class StoryModelTest(TestCase):
    fixtures = ['trip_journal']

    def test_saving_and_retriving_story(self):
        saved_stories = Story.objects.all()
        self.assertEqual(saved_stories.count(), 3)
        first_story = saved_stories[0]
        self.assertEqual(first_story.title, u'Сивуля')
        self.assertEqual(first_story.user, User.objects.get(username='Sasha'))

    def test_get_comments(self):
        story_ = Story.objects.get(title='Сивуля')
        story_comments = story_.get_comments()
        self.assertEqual(story_comments.count(), 1)
        self.assertEqual(story_comments[0].text, u'Я теж там була!')

    def test_get_tags(self):
        story = Story.objects.get(title='Давня історія')
        self.assertEqual(story.tags.all().count(), 2)

    @patch('trip_journal_app.models.Picture.get_stored_pic_by_size',
           new=stub_get_stored_pic_by_size)
    def test_get_pictures_urls(self):
        story_ = Story.objects.get(title='Сивуля')
        img_size = 400
        self.assertEqual(
            story_.get_pictures_urls(img_size),
            dict([
                (pic.id, 'pic_400_url') for pic
                in Picture.objects.filter(story=story_)
            ])
        )

    @patch('trip_journal_app.models.Story.get_pictures_urls',
           new=stub_get_pictures_urls)
    def test_get_text_with_pic_urls(self):
        story = Story.objects.get(title='Сивуля')
        text = story.get_text_with_pic_urls(400)
        for block in text:
            if block[u'type'] == u'img':
                self.assertIn(u'url', block)
                if block[u'id'] == 1:
                    self.assertEqual(block[u'url'], u'url1')


class PictureModelTest(TestCase):
    fixtures = ['trip_journal']

    def test_saving_and_retriving_pictures(self):
        saved_pictures = Picture.objects.all()
        self.assertEqual(saved_pictures.count(), 3)
        first_pic = saved_pictures[0]
        self.assertEqual(first_pic.story, Story.objects.get(title='Сивуля'))

    def test_get_stored_pic_by_size(self):
        pic = Picture.objects.all()[0]
        self.assertEqual(
            pic.get_stored_pic_by_size(503),
            Stored_picture.objects.filter(picture=pic).get(size=400)
        )
        self.assertEqual(
            pic.get_stored_pic_by_size(230),
            Stored_picture.objects.filter(picture=pic).get(size=400)
        )
        self.assertEqual(
            pic.get_stored_pic_by_size(2900),
            Stored_picture.objects.filter(picture=pic).get(size=2304)
        )


class StoredPictureModelTest(TestCase):
    fixtures = ['trip_journal']

    def test_saving_and_retriving_stored_picture(self):
        stored_pictures = Stored_picture.objects.all()
        self.assertEqual(stored_pictures.count(), 15)

        last_pic = stored_pictures[14]
        self.assertEqual(last_pic.picture, Picture.objects.all()[2])
        self.assertEqual(
            last_pic.size,
            3072
        )


class TagModleTset(TestCase):
    fixtures = ['trip_journal']

    def test_saving_and_retriving_tag(self):
        self.assertEqual(
            Story.objects.filter(tags__name='empty story').count(),
            2
        )


class CommentModelTest(TestCase):
    fixtures = ['trip_journal']

    def test_saving_and_retriving_comment(self):
        self.assertEqual(Comment.objects.all().count(), 2)
        self.assertEqual(
            Comment.objects.first().user,
            User.objects.get(username='Olesia'))

        self.assertEqual(
            Comment.objects.first().story,
            Story.objects.get(title='Сивуля'))

