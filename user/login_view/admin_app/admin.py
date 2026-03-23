from django.contrib import admin
from .models import ReservationLimitSetting


@admin.register(ReservationLimitSetting)
class ReservationLimitSettingAdmin(admin.ModelAdmin):
    list_display = ['max_per_user_per_day', 'updated_at']
