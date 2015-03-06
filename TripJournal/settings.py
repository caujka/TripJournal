"""
Django settings for TripJournal project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""
from django.conf.global_settings import TEMPLATE_CONTEXT_PROCESSORS

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# local settings
import TripJournal.local_settings as local_settings

from utils import client_key_and_secret

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '@n=0!!+!agam579351jf=+ka7xp&-6j)ofv_2j38au#$lp@hv4'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

TEMPLATE_DEBUG = True

TEMPLATE_CONTEXT_PROCESSORS += (
    'django.core.context_processors.request',
    'social.apps.django_app.context_processors.backends',
    'social.apps.django_app.context_processors.login_redirect',
)

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'trip_journal_app',
    'social.apps.django_app.default',
    'localization',
    # 'debug_toolbar',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'social.apps.django_app.middleware.SocialAuthExceptionMiddleware',
)

ROOT_URLCONF = 'TripJournal.urls'

WSGI_APPLICATION = 'TripJournal.wsgi.application'

SESSION_SERIALIZER = 'django.contrib.sessions.serializers.PickleSerializer'

# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'TripJournal',
        'USER': local_settings.db_user,
        'PASSWORD': local_settings.db_password,
        
    }
}

# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'en-us'

LANGUAGES = (
    ('uk', 'Ukraine'),
    ('en', 'English'),
)

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/

STATIC_URL = '/static/'

# login url is main page for now
LOGIN_URL = '/authorization_page/'
LOGIN_REDIRECT_URL = '/'

# sizes in which to store pictures
IMAGE_SIZES = [400, 700, 900, 1500]

# domain where pictures are stored
STORED_IMG_DOMAIN = 'http://localhost:4000/'

# place where images are stored locally
IMG_STORAGE = os.path.join(os.path.dirname(BASE_DIR), 'Pictures')

# place to temporary write image
TEMP_DIR = '/var/tmp'

AUTHENTICATION_BACKENDS = (
    'social.backends.facebook.FacebookOAuth2',
    'social.backends.google.GoogleOAuth2',
    'social.backends.vk.VKOAuth2',
    'django.contrib.auth.backends.ModelBackend',
)

CLIENT_SECRETS_DIR = os.path.join(BASE_DIR, 'TripJournal', 'client_secrets')

SOCIAL_AUTH_GOOGLE_OAUTH2_KEY, SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = (
     client_key_and_secret(CLIENT_SECRETS_DIR, 'google')
)
SOCIAL_AUTH_FACEBOOK_KEY, SOCIAL_AUTH_FACEBOOK_SECRET = (
     client_key_and_secret(CLIENT_SECRETS_DIR, 'facebook')
)
SOCIAL_AUTH_VK_OAUTH2_KEY, SOCIAL_AUTH_VK_OAUTH2_SECRET = (
     client_key_and_secret(CLIENT_SECRETS_DIR, 'vk')
)

SESSION_SERIALIZER = 'django.contrib.sessions.serializers.PickleSerializer'

LOCALE_PATHS = (
    os.path.join(BASE_DIR, 'locale'),
 )
