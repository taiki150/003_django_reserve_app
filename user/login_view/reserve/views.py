import json
from datetime import datetime, date, timedelta
from django.views.generic import(
    TemplateView,View, 
)
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .forms import ReservationForm
from django.db.models import Count
from django.db import IntegrityError
from .models import (Reservation)


# Create your views here.

# ******************************** #
#        予約作成API（非同期）            
# ******************************** #
class APIReserveCreateView(View):
    @method_decorator(login_required)
    def post(self, request, *args, **kwargs):
        try:
            # JSONデータを取得
            data = json.loads(request.body)
            selected_date = data.get('selected_date')
            selected_time = data.get('selected_time')
            print("="*50)
            print(f"data: {data}")
            print("="*50)
            
            if not selected_date or not selected_time:
                return JsonResponse({'success': False, 'error': '日付と時間が必須です'}, status=400)
            
            # 二重予約防止：同じユーザーが同じ日時で既に予約していないかチェック
            try:
                date_obj = datetime.strptime(selected_date, '%Y-%m-%d').date()
                time_obj = datetime.strptime(selected_time, '%H:%M').time()
            except ValueError:
                return JsonResponse({'success': False, 'error': '無効な日付または時間の形式です'}, status=400)
            if Reservation.objects.filter(user=request.user, date=date_obj, time=time_obj).exists():
                return JsonResponse({
                    'success': False,
                    'error': 'この日時は既に予約済みです。二重予約はできません。',
                    'error_code': 'duplicate_reservation'
                }, status=400)
            
            # フォームデータを作成
            form_data = {
                'date': selected_date,
                'time': selected_time,
            }
            
            form = ReservationForm(form_data)
            if form.is_valid():
                reservation = form.save(commit=False)
                reservation.user = request.user
                try:
                    reservation.save()
                except IntegrityError:
                    return JsonResponse({
                        'success': False,
                        'error': 'この日時は既に予約済みです。二重予約はできません。',
                        'error_code': 'duplicate_reservation'
                    }, status=400)
                return JsonResponse({'success': True, 'message': '予約が作成されました'}, status=200)
            else:
                errors = form.errors.as_json()
                return JsonResponse({'success': False, 'error': 'バリデーションエラー', 'errors': errors}, status=400)
                
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': '無効なJSONデータです'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)


# ******************************** #
#        予約更新API（非同期）            
# ******************************** #
class APIReserveUpdateView(View):
    @method_decorator(login_required)
    def post(self, request, *args, **kwargs):
        try:
            # JSONデータを取得
            data = json.loads(request.body)
            old_date = data.get('old_date')
            old_time = data.get('old_time')
            new_date = data.get('new_date')
            new_time = data.get('new_time')
            
            print("=== APIReserveUpdateView デバッグ ===")
            print(f"old_date: {old_date}, old_time: {old_time}")
            print(f"new_date: {new_date}, new_time: {new_time}")
            print(f"request.body: {request.body}")
            
            if not old_date or not old_time or not new_date or not new_time:
                print("エラー: 日付と時間が必須です")
                return JsonResponse({'success': False, 'error': '日付と時間が必須です'}, status=400)
            
            # 既存の予約を取得（文字列をDate/Timeオブジェクトに変換）
            try:
                old_date_obj = datetime.strptime(old_date, '%Y-%m-%d').date()
                old_time_obj = datetime.strptime(old_time, '%H:%M').time()
                print(f"変換後: old_date_obj={old_date_obj}, old_time_obj={old_time_obj}")
                reservation = Reservation.objects.get(
                    user=request.user,
                    date=old_date_obj,
                    time=old_time_obj
                )
                print(f"予約が見つかりました: {reservation}")
            except Reservation.DoesNotExist:
                print(f"エラー: 予約が見つかりません (date={old_date_obj}, time={old_time_obj})")
                return JsonResponse({'success': False, 'error': '予約が見つかりません'}, status=404)
            except ValueError as e:
                print(f"エラー: 無効な日付または時間の形式です - {e}")
                return JsonResponse({'success': False, 'error': '無効な日付または時間の形式です'}, status=400)
            
            # 新しい日付・時間をオブジェクトに変換
            try:
                new_date_obj = datetime.strptime(new_date, '%Y-%m-%d').date()
                new_time_obj = datetime.strptime(new_time, '%H:%M').time()
            except ValueError:
                return JsonResponse({'success': False, 'error': '無効な日付または時間の形式です'}, status=400)
            
            # 二重予約防止：変更先の日時が既に同一ユーザーで予約されていないか（自分以外の予約＝他枠との重複）
            if Reservation.objects.filter(user=request.user, date=new_date_obj, time=new_time_obj).exclude(pk=reservation.pk).exists():
                return JsonResponse({
                    'success': False,
                    'error': '変更先の日時は既に予約済みです。二重予約はできません。',
                    'error_code': 'duplicate_reservation'
                }, status=400)
            
            # 新しい日付・時間でフォームデータを作成
            form_data = {
                'date': new_date,
                'time': new_time,
            }
            
            form = ReservationForm(form_data)
            if form.is_valid():
                # 既存の予約を削除
                reservation.delete()
                
                # 新しい予約を作成
                new_reservation = form.save(commit=False)
                new_reservation.user = request.user
                try:
                    new_reservation.save()
                except IntegrityError:
                    return JsonResponse({
                        'success': False,
                        'error': '変更先の日時は既に予約済みです。二重予約はできません。',
                        'error_code': 'duplicate_reservation'
                    }, status=400)
                
                return JsonResponse({
                    'success': True, 
                    'message': '予約が更新されました',
                    'old_date': old_date,
                    'old_time': old_time,
                    'new_date': new_date,
                    'new_time': new_time
                }, status=200)
            else:
                errors = form.errors.as_json()
                return JsonResponse({'success': False, 'error': 'バリデーションエラー', 'errors': errors}, status=400)
                
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': '無効なJSONデータです'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)


# ******************************** #
#        予約削除API（非同期）            
# ******************************** #
class APIReserveDeleteView(View):
    @method_decorator(login_required)
    def post(self, request, *args, **kwargs):
        try:
            # JSONデータを取得
            data = json.loads(request.body)
            date = data.get('date')
            time = data.get('time')
            
            if not date or not time:
                return JsonResponse({'success': False, 'error': '日付と時間が必須です'}, status=400)
            
            # 日付と時間をDate/Timeオブジェクトに変換
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                time_obj = datetime.strptime(time, '%H:%M').time()
                reservation = Reservation.objects.get(
                    user=request.user,
                    date=date_obj,
                    time=time_obj
                )
            except Reservation.DoesNotExist:
                return JsonResponse({'success': False, 'error': '予約が見つかりません'}, status=404)
            except ValueError as e:
                return JsonResponse({'success': False, 'error': '無効な日付または時間の形式です'}, status=400)
            
            # 予約を削除
            reservation.delete()
            
            return JsonResponse({
                'success': True, 
                'message': '予約が削除されました',
                'date': date,
                'time': time
            }, status=200)
                
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': '無効なJSONデータです'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

# ******************************** #
#        予約検索API（非同期）            
# ******************************** #

class APIReserveSearchView(View):
    @method_decorator(login_required)
    def post(self, request, *args, **kwargs):

        try:
            #jsonデータの取得
            data = json.loads(request.body)
            startDate = data.get('start_date')
            endDate = data.get('end_date')
            times = data.get('times')

            # ログインユーザーの取得
            query = Reservation.objects.filter(user=request.user)

            ## startDate, endDateが両方存在すれば検索実行
            if startDate and endDate:
                query = query.filter(date__range=[startDate, endDate])

            # timesが存在すれば検索実行(上記の検索結果にプラスする)
            if times:
                query = query.filter(time__in=times)
            
            return JsonResponse({
                'success': True, 
                'message': '検索結果',
                'startDate': startDate,
                'endDate': endDate,
                'times': times,

            }, status=200)

            
        except json.JSONDecodeError:
            print("エラー: 無効なJSONデータです")
            # return JsonResponse({'success': False, 'error': '無効なJSONデータです'}, status=400)
        except Exception as e:
            print(f"エラー: {str(e)}")
            # return JsonResponse({'success': False, 'error': str(e)}, status=500)


# ******************************** #
#        予約カレンダー画面の表示            
# ******************************** #
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



# ******************************** #
#       予約詳細・履歴画面の表示            
# ******************************** #
class DetailView(TemplateView):
    template_name = 'reserve/detail.html'

    def get(self, request, *args, **kwargs):
        # 表示対象の日付範囲を設定
        # 過去1週間分 + 編集可能な1ヶ月分（本日から1ヶ月後まで）のみHTML生成
        today = date.today()
        one_week_ago = today - timedelta(days=7)
        one_month_later = today + timedelta(days=30)

        # ログインユーザーの予約を日付範囲でフィルタ（過去1週間〜1ヶ月後）
        # それ以外の予約はHTML生成しない（データ量削減）
        date_range_filter = {
            'user': request.user,
            'date__range': [one_week_ago, one_month_later]
        }
        reservations = Reservation.objects.filter(
            **date_range_filter
        ).values('date', 'time').order_by('date', 'time')

        reserved_dates = Reservation.objects.filter(
            **date_range_filter
        ).values_list('date', flat=True).distinct()
        
        # 日付を文字列形式に変換（JavaScript用）
        reserved_dates_str = [reserved_date.strftime('%Y-%m-%d') for reserved_date in reserved_dates]
        
        # 日付ごとに予約済み時間をグループ化（JavaScript用：YYYY-MM-DD形式）
        reserved_times_by_date_js = {}
        for reservation in reservations:
            date_str = reservation['date'].strftime('%Y-%m-%d')
            time_str = reservation['time'].strftime('%H:%M')
            if date_str not in reserved_times_by_date_js:
                reserved_times_by_date_js[date_str] = []
            reserved_times_by_date_js[date_str].append(time_str)
        
        # 表示用の予約済み時間（MM月DD日形式）
        # 各日付に対して、表示形式とISO形式の両方を含む辞書を作成
        reserved_times_by_date = {}
        for reserve in reservations:
            date_display = reserve['date'].strftime('%m月%d日')  # 表示用（日付）
            time_display = reserve['time'].strftime('%H:%M')  # 表示用（時間）
            date_iso = reserve['date'].strftime('%Y-%m-%d')  # ID用（ハイフン）
            time_id = reserve['time'].strftime('%H-%M')  # ID用（ハイフン）
            if date_display not in reserved_times_by_date:
                reserved_times_by_date[date_display] = {
                    'times': [],
                    'date_iso': date_iso  # ISO形式の日付を保存
                }
            # 時間を辞書形式で保存（表示用とID用の両方を含む）
            reserved_times_by_date[date_display]['times'].append({
                'display': time_display,
                'id': time_id
            })

        context = self.get_context_data(**kwargs)
        context['reserved_dates'] = reserved_dates_str
        context['reserved_times_by_date'] = reserved_times_by_date
        context['reserved_times_by_date_js'] = reserved_times_by_date_js
        context['days'] = list(range(1, 32))
        context['year_range'] = range(2025, 2032)
        context['month_range'] = range(1, 13)
        context['day_range'] = range(1, 32)

        return self.render_to_response(context)


# ******************************** #
#       予約統計の表示
# ******************************** #
class ReserveGraphView(TemplateView):
    """予約統計の確認ページ（時間帯別の予約件数など）"""
    template_name = 'reserve/reserve_graph.html'

    @method_decorator(login_required)
    def get(self, request, *args, **kwargs):
        # 時間帯別の予約件数（10:00, 11:00, ... ごと）
        time_counts = (
            Reservation.objects
            .values('time')
            .annotate(count=Count('id'))
            .order_by('time')
        )
        # テンプレート用に「10:00」形式のリストに変換
        stats_by_time = [
            {'time': r['time'].strftime('%H:%M'), 'count': r['count']}
            for r in time_counts
        ]
        context = self.get_context_data(**kwargs)
        context['stats_by_time'] = stats_by_time
        context['total_count'] = sum(s['count'] for s in stats_by_time)
        return self.render_to_response(context)


# ******************************** #
#        予約一覧取得API（非同期）            
# ******************************** #

class APIReserveGetDataView(View) :
    def get(self, request, *args, **kwargs):
        reservesAll = Reservation.objects.all()
        my_reserves = Reservation.objects.filter(user=request.user)

        all_reserve_data = list(reservesAll.values('id', 'date', 'time'))
        user_reserve_data = list(my_reserves.values('id', 'date', 'time'))

        return JsonResponse({
            'success': True, 
            'all_reserve_data': all_reserve_data,
            'user_reserve_data': user_reserve_data,
        }, status=200)