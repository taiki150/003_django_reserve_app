from django.urls import path
from .views import (
    ReserveView, DetailView, APIReserveCreateView, APIReserveUpdateView, APIReserveDeleteView
)

app_name = 'reserve'
# ********* reserve *********
urlpatterns = [
    path('reserve/', ReserveView.as_view(), name='reserve'),
    path('detail/', DetailView.as_view(), name='detail'),
    
    # 予約登録用のURL(非同期処理)
    path('api/reservation/create/', APIReserveCreateView.as_view(), name='api_create_reservation'),
    
    # 予約更新用のURL(非同期処理)
    path('api/reservation/update/', APIReserveUpdateView.as_view(), name='api_update_reservation'),
    
    # 予約削除用のURL(非同期処理)
    path('api/reservation/delete/', APIReserveDeleteView.as_view(), name='api_delete_reservation'),
    
]