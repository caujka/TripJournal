# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('trip_journal_app', '0005_auto_20150123_1333'),
    ]

    operations = [
        migrations.RenameField(
            model_name='subscriptions',
            old_name='user',
            new_name='subscriber',
        ),
    ]
