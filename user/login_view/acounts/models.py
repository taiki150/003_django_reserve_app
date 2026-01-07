from django.db import models

from django.contrib.auth.models import(
    BaseUserManager, AbstractBaseUser, PermissionsMixin
)

from django.urls import reverse_lazy

# Create your models here.

class UserManager(BaseUserManager):
    def create_user(self, user_name, email, password):
        
        if not email:
            raise ValueError('E-mailを入力してください')
        
        if not password:
            raise ValueError('パスワードを入力してください')
        
        user = self.model(
            username = user_name,
            email = self.normalize_email(email)
        )
        user.set_password(password)
        user.save()
        return user
    
class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=150)
    email = models.EmailField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = UserManager()

    def get_absolute_url(self):
        return reverse_lazy("acounts:home")
    
    