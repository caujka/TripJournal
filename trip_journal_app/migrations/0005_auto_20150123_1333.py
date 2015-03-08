# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('trip_journal_app', '0004_subscriptions'),
    ]

    operations = [
        migrations.AlterField(
            model_name='subscriptions',
            name='subscription',
            field=models.ForeignKey(related_name=b'subscription', to=settings.AUTH_USER_MODEL),
        ),
    ]
