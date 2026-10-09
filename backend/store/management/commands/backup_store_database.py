import os
import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Create a PostgreSQL archive before the clothing catalog reset.'

    def handle(self, *args, **options):
        database = settings.DATABASES['default']
        executable = shutil.which('pg_dump')
        if database['ENGINE'] != 'django.db.backends.postgresql' or not executable:
            raise CommandError('PostgreSQL and pg_dump are required for this archive command.')
        directory = Path(settings.BASE_DIR) / '.backups'
        directory.mkdir(exist_ok=True)
        output = directory / f'before-clothing-{datetime.now():%Y%m%d-%H%M%S}.dump'
        environment = os.environ.copy()
        environment['PGPASSWORD'] = database.get('PASSWORD', '')
        command = [executable, '--format=custom', '--no-owner', '--no-acl', '--file', str(output), '--host', database.get('HOST') or 'localhost', '--port', str(database.get('PORT') or 5432), '--username', database['USER'], database['NAME']]
        result = subprocess.run(command, env=environment, capture_output=True, text=True)
        if result.returncode:
            raise CommandError('Database backup failed; no catalog reset was performed. ' + result.stderr)
        self.stdout.write(str(output))
