# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('trip_journal_app', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='stored_picture',
            old_name='url',
            new_name='_url',
        ),
    ]
