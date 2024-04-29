import os
import csv
import threading
from datetime import datetime
from django.core.management import BaseCommand
from app.models import TickerData, CompanyTicker  # Import your models from the 'app' module

class Command(BaseCommand):
    help = 'Process CSV files in the div_info directory and populate TickerData model'

    def handle(self, *args, **kwargs):
        # Get the directory path for the CSV files
        csv_dir = os.path.dirname(os.path.realpath(__file__))
        csv_dir = os.path.join(csv_dir, '../../../../stockdata/div_info')
        print(csv_dir)

        # Get a list of CSV files in the directory
        csv_files = [f for f in os.listdir(csv_dir) if f.endswith('.csv')]

        # Define a function to process a CSV file and populate the database
        def process_csv(file_path):
            with open(file_path, 'r') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    ticker_symbol = row.get('ticker', 'TICK')
                    company_name = row.get('company_name', 'Unknown Company')
                    start_date = datetime.strptime(row.get('start_date', '1900-01-01'), '%Y-%m-%d').date()
                    end_date = datetime.strptime(row.get('end_date', '1900-01-01'), '%Y-%m-%d').date()
                    book_value = float(row.get('book_value', -1.0))
                    book_to_share_value = float(row.get('book_to_share_value', -1.0))
                    earnings_per_share = float(row.get('earnings_per_share', -1.0))
                    debt_ratio = float(row.get('debt_ratio', -1.0))
                    current_ratio = float(row.get('current_ratio', -1.0))
                    end_open = float(row.get('end_open', -1.0))
                    dividend_yield = float(row.get('dividend_yield', -1.0))
                    start_open = float(row.get('start_open', -1.0))
                    start_close = float(row.get('start_close', -1.0))
                    start_high = float(row.get('start_high', -1.0))
                    start_low = float(row.get('start_low', -1.0))
                    end_close = float(row.get('end_close', -1.0))
                    end_high = float(row.get('end_high', -1.0))
                    end_low = float(row.get('end_low', -1.0))
                    volume = float(row.get('volume', -1.0))

                    # Create or update CompanyTicker
                    company_ticker, _ = CompanyTicker.objects.get_or_create(ticker=ticker_symbol, defaults={'company_name': company_name})

                    # Create TickerData
                    ticker_data, created = TickerData.objects.update_or_create(
                        ticker=company_ticker,
                        start_date=start_date,
                        defaults={
                            'end_date': end_date,
                            'book_value': book_value,
                            'book_to_share_value': book_to_share_value,
                            'earnings_per_share': earnings_per_share,
                            'debt_ratio': debt_ratio,
                            'current_ratio': current_ratio,
                            'end_open': end_open,
                            'dividend_yield': dividend_yield,
                            'start_open': start_open,
                            'start_close': start_close,
                            'start_high': start_high,
                            'start_low': start_low,
                            'end_close': end_close,
                            'end_high': end_high,
                            'end_low': end_low,
                            'volume': volume,
                        }
                    )

                    if created:
                        self.stdout.write(self.style.SUCCESS(f'Successfully created TickerData: {ticker_data}'))
                    else:
                        self.stdout.write(self.style.WARNING(f'TickerData already exists: {ticker_data}'))

        # Create and start threads for processing CSV files
        threads = []
        for file_name in csv_files:
            file_path = os.path.join(csv_dir, file_name)
            thread = threading.Thread(target=process_csv, args=(file_path,))
            thread.start()
            threads.append(thread)

        # Wait for all threads to complete
        for thread in threads:
            thread.join()

        self.stdout.write(self.style.SUCCESS('All CSV files processed successfully'))
