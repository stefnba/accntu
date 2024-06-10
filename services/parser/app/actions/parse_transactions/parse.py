import concurrent.futures
import typing as t

import polars as pl
from sqlalchemy.orm import Session

from app.actions.parse_transactions.parsers.barclays_de_creditcard.parser import BarclaysDeCreditCardParser
from app.actions.parse_transactions.parsers.base import BaseParser
from app.actions.parse_transactions.parsers.milesandmore_ch_creditcard.parser import MilesAndMoreChCreditCardParser
from app.actions.parse_transactions.types import ParsedTransaction, ParseFile, ParserIds

parsers: dict[ParserIds, type[BaseParser]] = {
    "BARCLAYS_DE_CREDITCARD": BarclaysDeCreditCardParser,
    "MILESANDMORE_CH_CREDITCARD": MilesAndMoreChCreditCardParser,
    "UBS_CH_CREDITCARD": BarclaysDeCreditCardParser,
    "UBS_CH_ACCOUNT": BarclaysDeCreditCardParser,
}


def parse_one_transaction_file(file: ParseFile, parser_id: ParserIds) -> pl.DataFrame:
    """
    Parse a single transaction file as part of parallel processing.
    """

    # use parser based on parser_id
    parser = parsers[parser_id]()
    return parser.parse(file_uri=file.url, file_id=file.id)


def parse_transaction_files(
    files: list[ParseFile], parser_id: ParserIds, user_id: str, db: Session
) -> t.List[ParsedTransaction]:
    """
    Parallel parsing of multiple transaction files.
    """

    parsed_dfs: list[pl.DataFrame] = []

    # parse transactions in parallel
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = [executor.submit(parse_one_transaction_file, file, parser_id) for file in files]
    for future in concurrent.futures.as_completed(futures):
        result = future.result()

        parsed_dfs.append(result)

    # combine all parsed transactions
    parsed_df = pl.concat(parsed_dfs)

    # combine transactions and check for duplicates, sort by date, type, title
    unique_df = BaseParser.identify_duplicates(transactions=parsed_df, user_id=user_id, db=db).sort(
        "date", "type", "title", descending=[True, False, False]
    )

    return [ParsedTransaction(**record) for record in unique_df.to_dicts()]
