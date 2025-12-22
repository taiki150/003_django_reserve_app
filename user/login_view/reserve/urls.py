from django.urls import path
from .views import (
    ReserveView, DetailView, ReserveCreateView, APIReserveCreateView
)

app_name = 'reserve'
# ********* reserve *********
urlpatterns = [
    path('reserve/', ReserveView.as_view(), name='reserve'),
    path('detail/', DetailView.as_view(), name='detail'),
    
    # 予約登録用のURL
    path('reserve/create/', ReserveCreateView.as_view(), name='reseve_create'),

    ## 予約登録用のURL(非同期処理)
    path('api/reservation/create/', APIReserveCreateView.as_view(), name='api_create_reservation'),
    
]