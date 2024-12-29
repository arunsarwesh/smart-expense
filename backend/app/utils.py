import pandas as pd
from .models import Expense


def analyze_expenses(user):
    data = Expense.objects.filter(user=user).values('date', 'amount')
    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date'])
    monthly_total = df.groupby(df['date'].dt.to_period('M'))['amount'].sum().reset_index()
    monthly_total['date'] = monthly_total['date'].astype(str)
    return monthly_total.to_dict(orient='records')

