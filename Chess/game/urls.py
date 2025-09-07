from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),            # Home first
    path('join/', views.join, name='join'),       # Join second
    path('choose/', views.chooseMode, name='chooseMode'),  # Then Choose
    path('play/', views.playLocal, name='playLocal'),      # Local chess
    path('ai/', views.playAI, name='playAI'),              # AI chess
    path('board/', views.board, name='board'),
    path('reset/', views.resetBoard, name='resetBoard'),
]
