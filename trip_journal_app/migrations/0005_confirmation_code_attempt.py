# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('trip_journal_app', '0004_confirmation_code'),
    ]

    operations = [
        migrations.AddField(
            model_name='confirmation_code',
            name='attempt',
            field=models.IntegerField(default=0),
            preserve_default=True,
        ),
    ]
