from django.urls import path
from .views import *

urlpatterns = [
    path('expenses/', ExpenseView.as_view(), name='expenses'),
    path('expenses/<int:pk>/', ExpenseView.as_view(), name='expense-detail'),
    path('insights/', ExpenseInsightsView.as_view(), name='insights'),
    path('download_expenses_csv/', DownloadExpensesCSV.as_view(), name='download_expenses_csv'),
]
