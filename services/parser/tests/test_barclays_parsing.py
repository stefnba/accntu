from app.actions.parse_transactions.parsers.barclays_de_creditcard.parser import BarclaysDeCreditCardParser

test_parser = BarclaysDeCreditCardParser()

a = test_parser.parse(file_uri="file://tests/files/BARCLAYS_DE_CREDITCARD.xlsx", file_id="test")

print(a)
