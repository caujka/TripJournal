from django.db.models.signals import pre_delete
from django.dispatch import receiver
from trip_journal_app.models import Stored_picture
import os


@receiver(pre_delete, sender=Stored_picture)
def delete_pic_on_disk(sender, **kwargs):
    pic_file = os.path.join(sender.STORAGE, kwargs['instance']._url)
    if os.path.exists(pic_file):
        os.remove(pic_file)

