from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.utils import timezone
from reserve.models import Reservation
from django.conf import settings

class Command(BaseCommand):
    help = '予約当日9時に、本日の予約者へリマインドメールを送信'

    def handle(self, *args, **options):
        today = timezone.localdate()
        reservations = Reservation.objects.filter(date=today).select_related('user')
        to_email = getattr(settings, 'REMINDER_TEST_EMAIL', None) or r.user.email


        for r in reservations:
            subject = f'【リマインド】{today} の予約のお知らせ'
            message = f'{r.user.username} 様\n\n本日 {r.date} {r.time} のご予約をお忘れなく。'
            send_mail(subject, message, None, [to_email], fail_silently=False)