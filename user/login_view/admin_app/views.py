import json
from datetime import date, datetime
from django.shortcuts import redirect
from django.conf import settings
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.contrib.auth.mixins import UserPassesTestMixin
from django.views.generic import TemplateView, FormView, ListView, View
from django.urls import reverse_lazy
from django.http import JsonResponse
from django.core.mail import send_mail

from django.db import IntegrityError

from .forms import AdminLoginForm, ReservationLimitSettingForm
from .models import ReservationLimitSetting
from reserve.models import Reservation


class AdminLoginView(FormView):
    """管理者用ログイン画面"""
    template_name = 'admin_app/login.html'
    form_class = AdminLoginForm
    success_url = reverse_lazy('admin_app:home')

    def form_valid(self, form):
        email = form.cleaned_data['email']
        password = form.cleaned_data['password']
        user = authenticate(email=email, password=password)

        if user is None:
            messages.error(self.request, 'メールアドレスまたはパスワードが正しくありません。')
            return redirect('admin_app:login')

        if not user.is_staff:
            messages.error(self.request, '管理者権限がありません。')
            return redirect('admin_app:login')

        login(self.request, user)
        messages.success(self.request, '管理者としてログインしました。')
        return super().form_valid(form)


class AdminHomeView(UserPassesTestMixin, View):
    """管理者用ホーム画面"""
    template_name = 'admin_app/home.html'

    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.is_staff

    def handle_no_permission(self):
        return redirect('admin_app:login')

    def get_context_data(self, **kwargs):
        setting = ReservationLimitSetting.objects.first()
        form = kwargs.get('limit_form') or ReservationLimitSettingForm(
            instance=setting,
            initial=None if setting else {'max_per_user_per_day': 1}
        )
        return {
            'limit_form': form,
            **{k: v for k, v in kwargs.items() if k != 'limit_form'},
        }

    def get(self, request, *args, **kwargs):
        from django.shortcuts import render
        return render(request, self.template_name, self.get_context_data())

    def post(self, request, *args, **kwargs):
        from django.shortcuts import render
        setting = ReservationLimitSetting.objects.first()
        form = ReservationLimitSettingForm(request.POST, instance=setting)
        if form.is_valid():
            form.save()
            messages.success(request, '予約上限を更新しました。')
            return redirect('admin_app:home')
        return render(request, self.template_name, self.get_context_data(limit_form=form))


class AdminReserveView(UserPassesTestMixin, ListView):
    """管理者用予約管理画面"""
    model = Reservation
    template_name = 'admin_app/reserve.html'
    context_object_name = 'reservations'
    paginate_by = 10

    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.is_staff

    def handle_no_permission(self):
        return redirect('admin_app:login')

    def get_queryset(self):
        today = date.today()
        view_mode = self.request.GET.get('view', 'future')

        if view_mode == 'past':
            queryset = Reservation.objects.filter(date__lt=today).order_by('-date', '-time')
        else:
            queryset = Reservation.objects.filter(date__gte=today).order_by('date', 'time')
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['view_mode'] = self.request.GET.get('view', 'future')
        if 'limit_form' not in context:
            setting = ReservationLimitSetting.objects.first()
            context['limit_form'] = ReservationLimitSettingForm(
                instance=setting,
                initial=None if setting else {'max_per_user_per_day': 1},
            )
        return context

    def post(self, request, *args, **kwargs):
        """予約上限設定フォームの保存"""
        setting = ReservationLimitSetting.objects.first()
        form = ReservationLimitSettingForm(request.POST, instance=setting)
        if form.is_valid():
            form.save()
            messages.success(request, '予約上限を更新しました。')
            redirect_url = request.path
            if request.GET:
                redirect_url += '?' + request.GET.urlencode()
            return redirect(redirect_url)
        self.object_list = self.get_queryset()
        context = self.get_context_data(limit_form=form)
        return self.render_to_response(context)


class APIAdminReserveUpdateView(UserPassesTestMixin, View):
    """管理者用：予約日・予約時間の更新API"""

    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.is_staff

    def handle_no_permission(self):
        return JsonResponse({'success': False, 'error': '権限がありません'}, status=403)

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            reservation_id = data.get('reservation_id')
            new_date_str = data.get('new_date')
            new_time_str = data.get('new_time')

            if not reservation_id:
                return JsonResponse({'success': False, 'error': '予約IDが必須です'}, status=400)
            if not new_date_str and not new_time_str:
                return JsonResponse({'success': False, 'error': '新しい日付または時間のいずれかが必須です'}, status=400)

            reservation = Reservation.objects.get(pk=reservation_id)

            new_date = reservation.date
            if new_date_str:
                try:
                    new_date = datetime.strptime(new_date_str, '%Y-%m-%d').date()
                except ValueError:
                    return JsonResponse({'success': False, 'error': '無効な日付形式です（YYYY-MM-DD）'}, status=400)

            new_time = reservation.time
            if new_time_str:
                try:
                    t = datetime.strptime(new_time_str, '%H:%M').time()
                    allowed = [(10, 0), (11, 0), (12, 0), (13, 0), (14, 0)]
                    if (t.hour, t.minute) not in allowed:
                        return JsonResponse({'success': False, 'error': '時間は10:00〜14:00の正時のみ選択できます'}, status=400)
                    new_time = t
                except ValueError:
                    return JsonResponse({'success': False, 'error': '無効な時間形式です（HH:MM）'}, status=400)

            if Reservation.objects.filter(user=reservation.user, date=new_date, time=new_time).exclude(pk=reservation.pk).exists():
                return JsonResponse({'success': False, 'error': '同じ日時の予約が既に存在します'}, status=400)

            reservation.date = new_date
            reservation.time = new_time
            try:
                reservation.save()
            except IntegrityError:
                return JsonResponse({'success': False, 'error': '同じ日時の予約が既に存在します'}, status=400)

            response_data = {'success': True, 'message': '予約を更新しました'}
            if new_date_str:
                response_data['new_date'] = new_date.strftime('%Y-%m-%d')
            if new_time_str:
                response_data['new_time'] = new_time.strftime('%H:%M')
            return JsonResponse(response_data, status=200)
        except Reservation.DoesNotExist:
            return JsonResponse({'success': False, 'error': '予約が見つかりません'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': '無効なJSONです'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)


class APIAdminSendTestReminderView(UserPassesTestMixin, View):
    """管理者用：指定予約のテストメール送信API"""

    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.is_staff

    def handle_no_permission(self):
        return JsonResponse({'success': False, 'error': '権限がありません'}, status=403)

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            reservation_id = data.get('reservation_id')
            if not reservation_id:
                return JsonResponse({'success': False, 'error': '予約IDが必須です'}, status=400)

            reservation = Reservation.objects.select_related('user').get(pk=reservation_id)
            to_email = getattr(settings, 'REMINDER_TEST_EMAIL', None) or reservation.user.email

            subject = f'【リマインド】{reservation.date} の予約のお知らせ'
            message = f'{reservation.user.username} 様\n\n{reservation.date} {reservation.time} のご予約をお忘れなく。'
            send_mail(subject, message, None, [to_email], fail_silently=False)

            return JsonResponse({'success': True, 'message': 'テストメールを送信しました'}, status=200)
        except Reservation.DoesNotExist:
            return JsonResponse({'success': False, 'error': '予約が見つかりません'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': '無効なJSONです'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
