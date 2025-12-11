from django.urls import path
from .views import (
        RegistUserView, HomeView, UserLoginView, UserLogoutView, UserView,
        UserLoginView2, UserLogoutView2, 
)

app_name = 'acounts'
urlpatterns = [
    path('home/', HomeView.as_view(), name='home'),
    path('regist/', RegistUserView.as_view(), name='regist'),
    path('user_login/', UserLoginView.as_view(), name='user_login'),
    path('user_logout/', UserLogoutView.as_view(), name='user_logout'),
    path('reserve/', UserView.as_view(), name='reserve'),
    path('user_login2/', UserLoginView2.as_view(), name='user_login2'),
    path('user_logout2/', UserLogoutView2.as_view(), name='user_logout2'),
]