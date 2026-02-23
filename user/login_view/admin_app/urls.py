from django.urls import path
from .views import AdminHomeView

app_name = 'admin_app'
urlpatterns = [
    path('', AdminHomeView.as_view(), name='home'),
]
