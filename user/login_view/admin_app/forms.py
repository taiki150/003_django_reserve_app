from django import forms

from .models import ReservationLimitSetting


class AdminLoginForm(forms.Form):
    """管理者用ログインフォーム"""
    email = forms.EmailField(label='メールアドレス')
    password = forms.CharField(label='パスワード', widget=forms.PasswordInput())


class ReservationLimitSettingForm(forms.ModelForm):
    """1日あたりの予約上限設定フォーム"""

    class Meta:
        model = ReservationLimitSetting
        fields = ['max_per_user_per_day']
        labels = {
            'max_per_user_per_day': '1ユーザー1日あたりの予約上限（件）',
        }
        widgets = {
            'max_per_user_per_day': forms.NumberInput(attrs={'min': 1, 'max': 100}),
        }
