from django.urls import path
from .views import (
    ReserveView, DetailView, ReserveCreateView
)

app_name = 'reserve'
# ********* reserve *********
urlpatterns = [
    path('reserve/', ReserveView.as_view(), name='reserve'),
    path('detail/', DetailView.as_view(), name='detail'),

    path('reserve/create/', ReserveCreateView.as_view(), name='reseve_create'),

]