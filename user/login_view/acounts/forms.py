from django import forms
from .models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.forms import AuthenticationForm

class RegistForm(forms.ModelForm):
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        widgets = {
            'password': forms.PasswordInput(), # <input type="text">を<input type="password">に。
        }
        labels = {
            'username': '名前',
            'email': 'メールアドレス',
            'password':'パスワード',
        }
    def save(self, commit=False):
        user = super().save(commit=False)
        validate_password(self.cleaned_data['password'], user)
        user.set_password(self.cleaned_data['password'])
        user.save()
        return user
    
class UserLoginForm(forms.Form):
    email = forms.EmailField(label='メールアドレス')
    password = forms.CharField(label='パスワード', widget=forms.PasswordInput())

class UserLoginForm2(AuthenticationForm):
    username = forms.EmailField(label='メールアドレス')
    password = forms.CharField(label='パスワード', widget=forms.PasswordInput())
    remember = forms.BooleanField(label='セッション時間を短くする', required=False)


class UserUpdateForm(forms.ModelForm):
    """ユーザー情報編集用フォーム（パスワードは任意変更）"""
    new_password = forms.CharField(
        label='新しいパスワード',
        required=False,
        widget=forms.PasswordInput(attrs={'placeholder': '変更する場合のみ入力'}),
        help_text='変更しない場合は空欄のままにしてください'
    )
    new_password_confirm = forms.CharField(
        label='新しいパスワード（確認）',
        required=False,
        widget=forms.PasswordInput(attrs={'placeholder': '確認のため再入力'})
    )

    class Meta:
        model = User
        fields = ['username', 'email']
        labels = {
            'username': '名前',
            'email': 'メールアドレス',
        }

    def clean_new_password_confirm(self):
        new_password = self.cleaned_data.get('new_password')
        new_password_confirm = self.cleaned_data.get('new_password_confirm')
        if new_password or new_password_confirm:
            if new_password != new_password_confirm:
                raise forms.ValidationError('新しいパスワードが一致しません')
            if new_password:
                validate_password(new_password)
        return new_password_confirm

    def save(self, commit=True):
        user = super().save(commit=commit)
        new_password = self.cleaned_data.get('new_password')
        if new_password:
            user.set_password(new_password)
            if commit:
                user.save()
        return user