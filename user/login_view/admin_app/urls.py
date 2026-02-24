from django.urls import path
from .views import AdminHomeView, AdminLoginView, AdminReserveView, APIAdminReserveUpdateView

app_name = 'admin_app'
urlpatterns = [
    path('', AdminHomeView.as_view(), name='home'),
    path('login/', AdminLoginView.as_view(), name='login'),
    path('reserve/', AdminReserveView.as_view(), name='reserve'),
    path('api/reservation/update/', APIAdminReserveUpdateView.as_view(), name='api_reserve_update'),
]
