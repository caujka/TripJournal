from django.db import models
import json

# Create your models here.


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
        Returns a dictionary where pictures are keys and stored pictures
        of appropriate size are values.
        '''
        pictures = Picture.objects.filter(story=self.id)
        return dict([
            (pic.name, pic.get_stored_pic_by_size(max_size))
            for pic in pictures
        ])

    def get_text_with_pic_urls(self, max_pic_size):
        '''
        Takes story text and desirable size of pictures and changes picture
        names in text to respective urls.
        '''
        pics = self.get_pictures_urls(max_pic_size)
        text = json.loads(self.text, encoding='utf8')
        for block in text[u'content']:
            if block[u'type'] == u'img':
                block[u'url'] = pics[block[u'name']]
        return text


class Picture(models.Model):
    name = models.CharField(max_length=45, unique=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    story = models.ForeignKey(Story)

    def __unicode__(self):
        return self.name

    def get_stored_pic_by_size(self, max_accatible_size):
        '''
        Retrun the object Stored picture with the greatest size
        not bigger than max_accatible_size. If there isn't smaller
        pictures returns the smalles from available.
        '''
        story_pics = Stored_picture.objects.filter(picture=self.id)
        accetable_pics = story_pics.filter(size__lt=max_accatible_size)
        if accetable_pics:
            pic = accetable_pics.order_by('size').last()
            return pic
        return story_pics.order_by('size').first()


class Stored_picture(models.Model):
    picture = models.ForeignKey(Picture)
    size = models.IntegerField()
    url = models.CharField(max_length=2000)

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

