import json
from django.utils.formats import time_format
from django.views.generic import(
    TemplateView,CreateView,View, 
)
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from django.http import JsonResponse
from .forms import ReservationForm
from .models import (Reservation)


# Create your views here.

# ********* 予約登録の処理 *********
class ReserveCreateView(View):

    def post(self, request, *args, **kwargs):
        # POSTデータをフォームのフィールド名に合わせて変換
        form_data = {
            'date': request.POST.get('selected_date'),
            'time': request.POST.get('selected_time'),
        }
        
        form = ReservationForm(form_data)
        if form.is_valid():
            reservation = form.save(commit=False)
            reservation.user = request.user
            reservation.save()

            return redirect('reserve:reserve')

        else:
            return redirect('reserve:reserve')

# ********* 予約登録の処理（非同期） *********
class APIReserveCreateView(View):
    @method_decorator(login_required)
    def post(self, request, *args, **kwargs):
        try:
            # JSONデータを取得
            data = json.loads(request.body)
            selected_date = data.get('selected_date')
            selected_time = data.get('selected_time')
            
            if not selected_date or not selected_time:
                return JsonResponse({'success': False, 'error': '日付と時間が必須です'}, status=400)
            
            # フォームデータを作成
            form_data = {
                'date': selected_date,
                'time': selected_time,
            }
            
            form = ReservationForm(form_data)
            if form.is_valid():
                reservation = form.save(commit=False)
                reservation.user = request.user
                reservation.save()
                return JsonResponse({'success': True, 'message': '予約が作成されました'}, status=200)
            else:
                errors = form.errors.as_json()
                return JsonResponse({'success': False, 'error': 'バリデーションエラー', 'errors': errors}, status=400)
                
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': '無効なJSONデータです'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)




class ReserveView(TemplateView):
    template_name = 'reserve/reserve.html'

    @method_decorator(login_required)
    def get(self, request, *args, **kwargs):
        # ログインユーザーの予約済み日付を取得
        reserved_dates = Reservation.objects.filter(
            user=request.user
        ).values_list('date', flat=True).distinct()

        # 日付と時間の組み合わせを取得
        reservations = Reservation.objects.filter(
            user=request.user
        ).values('date', 'time')
        
        # 日付を文字列形式に変換
        reserved_dates_str = [reserved_date.strftime('%Y-%m-%d') for reserved_date in reserved_dates]
        
        # 日付ごとに予約済み時間をグループ化
        # 例: {'2024-12-13': ['10:00', '12:00'], '2024-12-14': ['11:00']}
        reserved_times_by_date = {}
        for reservation in reservations:
            date_str = reservation['date'].strftime('%Y-%m-%d')
            time_str = reservation['time'].strftime('%H:%M')
            if date_str not in reserved_times_by_date:
                reserved_times_by_date[date_str] = []
            reserved_times_by_date[date_str].append(time_str)
        
        context = self.get_context_data(**kwargs)
        context['reserved_dates'] = reserved_dates_str
        context['reserved_times_by_date'] = reserved_times_by_date
        # 日付リスト
        context['days'] = list(range(1, 32))
        times_btn = ['10:00', '11:00', '12:00', '13:00', '14:00']
        context['times'] = times_btn
        return self.render_to_response(context)


class DetailView(TemplateView):
    template_name = 'reserve/detail.html'

    def get(self, request, *args, **kwargs):
        reservations =  Reservation.objects.filter(
            user=request.user
        ).values('date', 'time').distinct()

        reserved_times_by_date = {}
        for reserve in reservations:
            date = reserve['date'].strftime('%m月%d日')
            time = reserve['time'].strftime('%H:%M')
            if date not in reserved_times_by_date:
                reserved_times_by_date[date] = []
            reserved_times_by_date[date].append(time)

        # print("="*50)
        # print(f"reserve_datas: {reserved_times_by_date}")
        # print("="*50)

        context = self.get_context_data(**kwargs)
        context['reserved_times_by_date'] = reserved_times_by_date
        context['days'] = list(range(1, 32))

        return self.render_to_response(context)