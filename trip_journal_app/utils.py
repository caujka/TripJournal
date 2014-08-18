import os
from TripJournal.settings import MEDIA_ROOT
from unidecode import unidecode
from django.template.defaultfilters import slugify


def saved_stories():
    '''
    Retrurns the list of strings - names of saved stories in the media
    directory without ".json" ending.
    '''
    return [
        file_name[:-5] for file_name in os.listdir(MEDIA_ROOT) if (
            os.path.isfile(os.path.join(MEDIA_ROOT, file_name)) and
            file_name.endswith('.json')
        )
    ]


def unicode_slugify(uni_string):
    return slugify(unidecode(uni_string))
