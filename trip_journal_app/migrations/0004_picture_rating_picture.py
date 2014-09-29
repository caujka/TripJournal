# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('trip_journal_app', '0003_auto_20140927_1122'),
    ]

    operations = [
        migrations.AddField(
            model_name='picture',
            name='rating_picture',
            field=models.IntegerField(default=0),
            preserve_default=True,
        ),
    ]
