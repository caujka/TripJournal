import json
import os
import math

from django.db import models
from django.contrib.auth.models import User
from notifications import notify

from TripJournal.settings import (IMAGE_SIZES, STORED_IMG_DOMAIN,
                                  IMG_STORAGE, TEMP_DIR)
from trip_journal_app.utils.resize_image import resize_and_save_pics


class Tag(models.Model):
    name = models.CharField(max_length=255, unique=True)
    datetime = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return self.name

class Story(models.Model):
    title = models.CharField(max_length=300)
    date_travel = models.DateField()
    date_publish = models.DateTimeField(auto_now_add=True)
    text = models.TextField()
    track = models.TextField(blank=True, null=True)
    likes = models.ManyToManyField(User)
    published = models.BooleanField(default=False)
    user = models.ForeignKey(User, related_name='owner')
    tags = models.ManyToManyField(Tag)

    def __unicode__(self):
        return self.title

    def get_pictures_urls(self):
        '''
        Returns a dictionary where pictures ids are keys and tuple of all
        stored pictures sizes and respective urls size are values.
        '''
        pictures = Picture.objects.filter(story=self.id)
        return dict([
            (pic.id, tuple({'size': stored_pic.size, 'url': stored_pic.url} for
                           stored_pic in pic.get_stored_pics()))
            for pic in pictures
        ])

    def get_text_with_pic_urls(self):
        '''
        Takes story text and desirable size of pictures and adds
        urls to respective block of content.
        '''
        pics = self.get_pictures_urls()
        text = json.loads(self.text, encoding='utf8')
        for block in text:
            if block[u'type'] == u'img':
                block[u'url'] = pics[block[u'id']]
        return text

    def get_text_with_pic_objects(self):
        text = json.loads(self.text, encoding='utf8')
        # for situations when picture id wasn't saved for some reason
        text = filter(
            lambda x: x['type'] != "img" or not x['id'] is None, text
        )
        for block in text:
            if block[u'type'] == u'img':
                block[u'pic'] = Picture.objects.get(pk=int(block[u'id']))
                galleryId = block.get('galleryId', '')
                block[u'galery_picture'] = Picture.objects.filter(
                    id__in=galleryId)
        return text



    @classmethod
    def get_sorted_stories_list(cls, latitude, longitude):
        stories = cls.objects.all()
        list_of_stories = []
        for st in stories:
            if st.published:
                coordinates = []
                distance = []
                pictures = Picture.objects.filter(story_id=st.id)
                artifacts = Map_artifact.objects.filter(story_id=st.id)
                for picture in pictures:
                    if picture.latitude and picture.longitude:
                        coordinates.append(
                            [float(picture.latitude), float(picture.longitude)])
                for artifact in artifacts:
                    if artifact.latitude and artifact.longitude:
                        coordinates.append(
                            [float(artifact.latitude), float(artifact.longitude)])
                if coordinates:
                    for coordinate in coordinates:
                        dist = math.sqrt(
                            (latitude - coordinate[0]) ** 2 + (longitude - coordinate[1]) ** 2)
                        distance.append(dist)
                    list_of_stories.append(
                        {'story': st, 'distance': min(distance)})
        list_of_stories.sort(key=lambda k: k['distance'])
        return list_of_stories

    def likes_count(self):
        return self.likes.count()

    def is_liked_by(self, user):
        return self.likes.filter(id=user.id).exists()

    def first_text(self):
        return next((block for block in self.get_text_with_pic_objects()
                     if block['type'] == 'text'), None)

    def first_img(self):
        return next((block for block in self.get_text_with_pic_objects()
                     if block['type'] == 'img'), None)

    def notify(self, user):
        not_notify = UserNotify.objects.filter(notification_off=True)
        banned_stories = Notification_ban.objects.filter(banned_story=self)
        if self.user != user and not not_notify.filter(user=self.user).exists() and \
            not banned_stories.filter(user=self.user).exists():
            notify.send(user,
                        recipient=self.user,
                        verb="{user.username} liked your story".format(user=user),
                        target=self,
                        )


class Picture(models.Model):
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    story = models.ForeignKey(Story)
    likes = models.ManyToManyField(User)
    SIZES = IMAGE_SIZES

    def __unicode__(self):
        return str(self.id)

    def likes_count(self):
        '''
        Returns a number of users that liked this picture.
        '''
        return self.likes.count()

    def is_liked_by(self, user):
        '''
        Retrun True if the user has liked the picture, Fasle otherwise.
        '''
        return self.likes.filter(id=user.id).exists()

    def get_stored_pics(self):
        '''
        Retruns the QuerySet of all stored pictures associated
        with this picture.
        '''
        return Stored_picture.objects.filter(picture=self.id)

    def get_stored_pic_by_size(self, acceptable_size):
        '''
        Retrun the object Stored_picture with the smallest size
        not smaller than acceptable_size. If there isn't a larger
        picture than acceptable_size returns the largest from available.
        '''
        story_pics = Stored_picture.objects.filter(picture=self.id)
        acceptable_pics = story_pics.filter(size__gte=acceptable_size)
        if acceptable_pics:
            pic = acceptable_pics.order_by('size').first()
            return pic
        return story_pics.order_by('size').last()

    def save_in_sizes(self, image):
        '''
        Stores info about picture and it's thumbnails in database
        and writes them to path defined in Stored_picture class.
        '''
        # check if Pictures directory exists
        if not os.path.exists(Stored_picture.STORAGE):
            os.makedirs(Stored_picture.STORAGE)

        # temporary storing file
        img_name = image.name
        file_name = os.path.join(TEMP_DIR, img_name)
        with open(file_name, 'w') as img_file:
            for chunk in image.chunks():
                img_file.write(chunk)

        # resizing original image
        names_and_sizes = resize_and_save_pics(
            file_name, str(self.id), self.SIZES, Stored_picture.STORAGE
        )
        for name, size in names_and_sizes:
            stored_pic = Stored_picture(picture=self, size=size)
            stored_pic.url = name
            stored_pic.save()

        # delete temp file
        os.remove(file_name)

    @classmethod
    def get_sorted_picture_list(cls, latitude, longitude):
        req = ('SELECT (POWER(latitude - %f, 2) + POWER(longitude - %f, 2)) '
               'as distance, id, latitude, longitude from trip_journal_app_picture '
               'WHERE latitude IS NOT NULL AND longitude IS NOT NULL '
               'ORDER BY distance;' % (latitude, longitude))
        list_of_pictures = list(Picture.objects.raw(req))
        return list_of_pictures

    def notify(self, user):
        not_notify = UserNotify.objects.filter(notification_off=True)
        banned_stories = Notification_ban.objects.filter(banned_story=self.story)
        if self.story.user != user and not not_notify.filter(user=self.story.user).exists() and \
            not banned_stories.filter(user=self.story.user).exists():
            notify.send(user,
                        recipient=self.story.user,
                        verb="{user.username} liked your picture".format(user=user),
                        target=self.story,
                        )


class Stored_picture(models.Model):
    picture = models.ForeignKey(Picture)
    size = models.IntegerField()
    _url = models.CharField(max_length=2000)
    STORAGE = IMG_STORAGE
    URL_PREFIX = STORED_IMG_DOMAIN

    def __unicode__(self):
        return self.url

    @property
    def url(self):
        return self.URL_PREFIX + self._url

    @url.setter
    def url(self, value):
        self._url = value


class Comment(models.Model):
    text = models.CharField(max_length=1000)
    user = models.ForeignKey(User)
    story = models.ForeignKey(Story)
    time = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return self.text

    def notify(self, story_id):
        author = Story.objects.get(pk=story_id).user
        story = Story.objects.get(pk=story_id)
        not_notify = UserNotify.objects.filter(notification_off=True)
        banned_stories = Notification_ban.objects.filter(banned_story=story)
        if self.user != author and not not_notify.filter(user=author).exists() and \
            not banned_stories.filter(user=author).exists():
                notify.send(self.user,
                            recipient=author,
                            verb="Your story was commented",
                            target=story,
                            )
        comments = Comment.objects.filter(story_id=story_id)
        commenters = {comment.user for comment in comments if comment.user != author}
        if self.user in commenters:
            commenters.remove(self.user)
        for user in commenters:
            if not not_notify.filter(user=user).exists():
                notify.send(self.user,
                            recipient=user,
                            verb="The story which you'd commented was commented",
                            target=story,
                            )


class Map_artifact(models.Model):
    text = models.TextField()
    story = models.ForeignKey(Story)
    latitude = models.FloatField()
    longitude = models.FloatField()
    name = models.CharField(max_length=45, unique=True)

    def __unicode__(self):
        return self.name

class Confirmation_code(models.Model):
    code = models.TextField()
    start_time = models.TextField()
    attempt = models.IntegerField(default=0)
    user = models.ForeignKey(User)

class Notification_ban(models.Model):
    user = models.ForeignKey(User)
    banned_user = models.ForeignKey(User, related_name="banned_user", null=True)
    banned_story = models.ForeignKey(Story, related_name="banned_story", null=True)

    def __unicode__(self):
        return self.user.username


class UserNotify(models.Model):
    user = models.ForeignKey(User, unique=True)
    notification_off = models.BooleanField(default=False)

    def __unicode__(self):
        return self.user.username


class Subscriptions(models.Model):
    """ Subcriptions list """
    subscriber = models.ForeignKey(User)
    subscription = models.ForeignKey(User, related_name = "subscription")

    def __unicode__(self):
        return self.subscription

