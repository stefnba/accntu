from app.parser.barclays_de_creditcard import BarclasyDeCreditCardParser
from app.parser.base import BaseParser
from app.type import ParserIds

parsers: dict[ParserIds, type[BaseParser]] = {
    "BARCLAYS_DE_CREDITCARD": BarclasyDeCreditCardParser,
}
