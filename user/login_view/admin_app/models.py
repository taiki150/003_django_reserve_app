from django.db import models


class ReservationLimitSetting(models.Model):
    """1ユーザー1日あたりの予約上限設定（1行のみ使用）"""
    max_per_user_per_day = models.PositiveIntegerField(
        verbose_name='1日あたりの予約上限数',
        default=1,
        help_text='1ユーザーが1日に行える予約の最大件数'
    )
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新日時')

    class Meta:
        verbose_name = '予約上限設定'
        verbose_name_plural = '予約上限設定'

    def __str__(self):
        return f'1日{self.max_per_user_per_day}件まで'

    @classmethod
    def get_limit(cls):
        """現在の上限値を取得（レコードがなければ1を返す）"""
        setting = cls.objects.first()
        return setting.max_per_user_per_day if setting else 1
