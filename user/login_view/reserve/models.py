from django.db import models
from django.conf import settings

# Create your models here.



class Reservation(models.Model):
    """予約モデル"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name='ユーザー'
    )
    date = models.DateField(verbose_name='予約日')
    time = models.TimeField(verbose_name='予約時間')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='作成日時')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新日時')

    class Meta:
        verbose_name = '予約'
        verbose_name_plural = '予約'
        ordering = ['date', 'time']
        # 同じユーザーが同じ日時で重複予約できないようにする
        unique_together = ['user', 'date', 'time']

    def __str__(self):
        return f"{self.user.username} - {self.date} {self.time}"
