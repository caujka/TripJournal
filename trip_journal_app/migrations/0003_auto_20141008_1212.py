# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('trip_journal_app', '0002_picture_likes'),
    ]

    operations = [
        migrations.RenameField(
            model_name='story',
            old_name='rating',
            new_name='likes',
        ),
    ]
