from django.apps import AppConfig


class TripJournalConfig(AppConfig):
    name = 'trip_journal_app'
    verbose_name = "Trip Journal Application"

    def ready(self):
        import signals

