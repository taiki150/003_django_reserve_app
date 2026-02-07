from django.shortcuts import render, redirect
from django.views.generic import(
    TemplateView, CreateView, FormView, View
)
from django.urls import reverse_lazy
from django.contrib.auth import authenticate, login, logout
from .forms import RegistForm, UserLoginForm, UserLoginForm2
from django.contrib.auth.views import LoginView, LogoutView

class HomeView(TemplateView):
    template_name = 'home.html'


class RegistUserView(CreateView):
    template_name = 'regist.html'
    form_class = RegistForm
    succenss_url = reverse_lazy('acounts:home')

class UserLoginView(FormView):
    template_name = 'user_login.html'
    form_class = UserLoginForm
    success_url = reverse_lazy('reserve:reserve')

    def form_valid(self, form):
        email = form.cleaned_data['email']
        password = form.cleaned_data['password']
        user = authenticate(email=email, password=password)
        if user:
            login(self.request, user)
        return super().form_valid(form)
    
    def get_success(self):
        next_url = self.request.GET.get('next')
        print('next: ', next_url)
        return next_url if next_url else self.success_url


    
class UserLogoutView(View):
    def get(self, request, *args, **kwargs):
        return render(request, 'user_logout.html')
    
    def get(self, request, *args, **kwargs):
        logout(request)
        return redirect('acounts:home')
    
class UserLoginView2(LoginView):
    template_name = 'user_login2.html'
    next_page = reverse_lazy('reserve:reserve')
    form_class = UserLoginForm2

    def form_valid(self, form):
        result = super().form_valid(form)
        print(self.request.user)
        remember = form.cleaned_data['remember']
        if remember :
            self.request.session.set_expiry(120000)
        return result
    
class UserLogoutView2(LogoutView):
    next_page = reverse_lazy('acounts:home')
    http_method_names = ['get', 'post']
    template_name = 'acounts/user_logout.html'
