import os

# Deliberately non-secret and restricted to isolated tests.
os.environ.setdefault('DJANGO_SECRET_KEY', 'test-only-key-not-for-deployment')
from .settings import *  # noqa: E402,F403

DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
