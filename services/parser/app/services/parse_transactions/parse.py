import concurrent.futures

import polars as pl
from sqlalchemy.orm import Session

from app.services.parse_transactions.parsers.barclays_de_creditcard.parser import BarclasyDeCreditCardParser
from app.services.parse_transactions.parsers.base import BaseParser
from app.type import ParseFile, ParserIds

parsers: dict[ParserIds, type[BaseParser]] = {
    "BARCLAYS_DE_CREDITCARD": BarclasyDeCreditCardParser,
}


def parse_one_transaction_file(file: ParseFile, parser_id: ParserIds) -> pl.DataFrame:
    parser = parsers[parser_id]()
    return parser.parse(file)


def parse_transaction_files(files: list[ParseFile], parser_id: ParserIds, user_id: str, db: Session):

    file_ids = [file.id for file in files]
    parsed_dfs: list[pl.DataFrame] = []

    # parse transactions in parallel
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = [executor.submit(parse_one_transaction_file, file, parser_id) for file in files]
    for future in concurrent.futures.as_completed(futures):
        result = future.result()

        parsed_dfs.append(result)

    parsed_df = pl.concat(parsed_dfs).sort("date", "type", "title", descending=[True, False, False])

    # combine transactions and check for duplicates
    unique_df = BaseParser.identify_duplicates(transactions=parsed_df, user_id=user_id, db=db)

    return {file_id: unique_df.filter(pl.col("file_id") == file_id).to_dicts() for file_id in file_ids}
