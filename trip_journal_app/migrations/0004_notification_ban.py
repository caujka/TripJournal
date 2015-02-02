# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('trip_journal_app', '0003_auto_20141008_1212'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification_ban',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('banned_story', models.ForeignKey(related_name=b'banned_story', to='trip_journal_app.Story', null=True)),
                ('banned_user', models.ForeignKey(related_name=b'banned_user', to=settings.AUTH_USER_MODEL, null=True)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
