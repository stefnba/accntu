from io import BytesIO

import pandas as pd
import polars as pl

from app.actions.parse_transactions.parsers.base import BaseParser
from app.utils.duckdb import SQL, DuckDB

SQL_QUERY = {
    "transform": SQL("sql/transform.sql"),
}


class MilesAndMoreChCreditCardParser(BaseParser):

    date_format = "%m-%d-%y"
    # default_currency = "CHF"

    key_cols = [
        "Transaction date",
        "Description",
        "Amount",
    ]

    def read_into_df(self, content: bytes) -> pl.DataFrame:
        """
        Read content into DataFrame.
        """
        return pl.from_pandas(pd.read_excel(BytesIO(content), date_format=self.date_format))

    def transform(self, df: pl.DataFrame) -> pl.DataFrame:
        return DuckDB.query(SQL_QUERY["transform"], data=df)
