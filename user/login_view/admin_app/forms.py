from django import forms


class AdminLoginForm(forms.Form):
    """管理者用ログインフォーム"""
    email = forms.EmailField(label='メールアドレス')
    password = forms.CharField(label='パスワード', widget=forms.PasswordInput())
