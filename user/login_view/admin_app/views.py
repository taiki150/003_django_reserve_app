from django.views.generic import TemplateView


class AdminHomeView(TemplateView):
    """管理者用ホーム画面"""
    template_name = 'admin_app/home.html'
