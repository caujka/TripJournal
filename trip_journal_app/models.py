from django.db import models
import json
import os
from PIL import Image
from TripJournal.settings import BASE_DIR
from trip_journal_app.utils.resize_img import resize, save_pic


class User(models.Model):
    '''
    Fake class for user while we don't know what the real one will
    look like.
    '''
    name = models.CharField(max_length=45, unique=True)
    oauth_service = models.CharField(max_length=45)
    oauth_id = models.CharField(max_length=45)

    def __unicode__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __unicode__(self):
        return self.name


class Story(models.Model):
    title = models.CharField(max_length=300)
    date_travel = models.DateField()
    date_publish = models.DateTimeField(auto_now_add=True)
    text = models.TextField()
    track = models.TextField(blank=True, null=True)
    rating = models.FloatField(blank=True, null=True)
    published = models.BooleanField(default=False)
    user = models.ForeignKey(User)
    tags = models.ManyToManyField(Tag)

    def __unicode__(self):
        return self.title

    def get_tags(self):
        return self.tags.all()

    def get_comments(self):
        return Comment.objects.filter(story=self.id)

    def get_map_artifacts(self):
        return Map_artifact.objects.filter(story=self.id)

    def get_pictures_urls(self, max_size):
        '''
        Returns a dictionary where pictures ids are keys and stored pictures
        of appropriate size are values.
        '''
        pictures = Picture.objects.filter(story=self.id)
        return dict([
            (pic.id, pic.get_stored_pic_by_size(max_size))
            for pic in pictures
        ])

    def get_text_with_pic_urls(self, max_pic_size):
        '''
        Takes story text and desirable size of pictures and adds
        urls to respective block of content.
        '''
        pics = self.get_pictures_urls(max_pic_size)
        text = json.loads(self.text, encoding='utf8')
        for block in text:
            if block[u'type'] == u'img':
                block[u'url'] = pics[block[u'id']]
        return text


class Picture(models.Model):
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    story = models.ForeignKey(Story)
    SIZES = [400, 700, 900, 1500]

    def __unicode__(self):
        return self.name

    def get_stored_pic_by_size(self, max_accatible_size):
        '''
        Retrun the object Stored picture with the greatest size
        not bigger than max_accatible_size. If there isn't smaller
        pictures returns the smallest from available.
        '''
        story_pics = Stored_picture.objects.filter(picture=self.id)
        accetable_pics = story_pics.filter(size__lt=max_accatible_size)
        if accetable_pics:
            pic = accetable_pics.order_by('size').last()
            return pic
        return story_pics.order_by('size').first()

    def save_in_sizes(self, image):
        '''
        Stores info about picture and it's thumbnails in database
        and writes them to path defined in Stored_picture class.
        '''
        # check if Pictures directory exists
        if not os.path.exists(Stored_picture.SAVE_PATH):
            os.makedirs(Stored_picture.SAVE_PATH)
        img_name = image.name
        img_extension = img_name.split('.')[1]
        file_name = os.path.join('/var/tmp', img_name)
        with open(file_name, 'w') as img_file:
            for chunk in image.chunks():
                img_file.write(chunk)
        orig_img = Image.open(file_name)
        orig_size = max(orig_img.size)
        for size in [s for s in self.SIZES if s < orig_size] + [orig_size]:
            resized_img = orig_img
            if size != orig_size:
                resized_img = resize(file_name, size)
            stored_pic = Stored_picture(picture=self, size=size)
            new_name = save_pic(
                resized_img, str(self.id) + '.' + img_extension,
                size, stored_pic.SAVE_PATH
                )
            stored_pic.url = stored_pic.URL_PREFIX + new_name
            stored_pic.save()
        # delete temp file
        os.remove(file_name)


class Stored_picture(models.Model):
    picture = models.ForeignKey(Picture)
    size = models.IntegerField()
    url = models.CharField(max_length=2000)
    SAVE_PATH = os.path.join(os.path.dirname(BASE_DIR), 'Pictures')
    URL_PREFIX = 'http://localhost:4000/'

    def __unicode__(self):
        return self.url


class Comment(models.Model):
    text = models.CharField(max_length=1000)
    user = models.ForeignKey(User)
    story = models.ForeignKey(Story)
    time = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return self.text


class Map_artifact(models.Model):
    text = models.TextField()
    story = models.ForeignKey(Story)
    latitude = models.FloatField()
    longitude = models.FloatField()
    name = models.CharField(max_length=45, unique=True)

    def __unicode__(self):
        return self.name

