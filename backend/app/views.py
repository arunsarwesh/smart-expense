from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Expense
from .serializers import ExpenseSerializer
import pandas as pd
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .utils import analyze_expenses # Assuming the function is in utils.py
import csv
from django.http import HttpResponse

class SignupView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email")

        if not username or not password or not email:
            return Response(
                {"error": "All fields are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            User.objects.create_user(username=username, password=password, email=email)
            return Response({"message": "User created successfully!"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully!"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ExpenseView(APIView):
    permission_classes = [IsAuthenticated]

    # GET all expenses
    def get(self, request):
        expenses = Expense.objects.filter(user=request.user).order_by('-id')
        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)

    # POST a new expense
    def post(self, request):
        data = request.data
        serializer = ExpenseSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # PUT (Edit) an existing expense
    def put(self, request, pk):
        try:
            expense = Expense.objects.get(pk=pk, user=request.user)  # Ensure the expense belongs to the authenticated user
        except Expense.DoesNotExist:
            return Response({"detail": "Expense not found."}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        serializer = ExpenseSerializer(expense, data=data)

        if serializer.is_valid():
            serializer.save()  # Save the updated expense
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE an expense
    def delete(self, request, pk):
        try:
            expense = Expense.objects.get(pk=pk, user=request.user)
        except Expense.DoesNotExist:
            return Response({"detail": "Expense not found."}, status=status.HTTP_404_NOT_FOUND)

        expense.delete()  # Delete the expense
        return Response({"detail": "Expense deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    
# Analyze Expenses

class ExpenseInsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            insights = analyze_expenses(user).order_by('-id')
            return Response(insights, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
        # Download Expenses CSV for a User (Authenticated user)
class DownloadExpensesCSV(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        expenses = Expense.objects.filter(user=user)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="expenses.csv"'

        writer = csv.writer(response)
        writer.writerow(['Amount', 'Description', 'Date', 'Category'])

        for expense in expenses:
            writer.writerow([expense.amount, expense.description, expense.date, expense.category])

        return response