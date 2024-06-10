from app.services.parse_transactions.parsers.barclays_de_creditcard.parser import TestBarclaysDeCreditCardParser

test_parser = TestBarclaysDeCreditCardParser()

test_parser.test_parse("tests/files/BARCLAYS_DE_CREDITCARD.xlsx")
