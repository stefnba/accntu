from io import BytesIO

import pandas as pd
import polars as pl

from app.actions.parse_transactions.parsers.base import BaseParser


class BarclaysDeCreditCardParser(BaseParser):

    date_format = "%d.%m.%Y"
    default_currency = "EUR"
    skiprows = 12

    key_cols = [
        "Buchungsdatum",
        "Beschreibung",
        "Originalbetrag",
    ]

    def read_into_df(self, content: bytes) -> pl.DataFrame:
        """
        Read content into DataFrame.
        """

        return pl.from_pandas(pd.read_excel(BytesIO(content), skiprows=self.skiprows))

    def transform(self, df: pl.DataFrame) -> pl.DataFrame:

        df = df.select(
            [
                pl.col("Buchungsdatum").alias("date"),
                pl.col("Land").alias("country"),
                pl.col("Betrag").alias("account_amount"),
                pl.col("Originalbetrag").alias("spending_amount"),
                pl.col("Beschreibung").alias("title"),
                pl.lit(self.default_currency).alias("account_currency"),
                pl.col("Typ").alias("type"),
                pl.col("key").name.keep(),
            ]
        ).with_columns(
            [
                pl.col("date").str.to_date(self.date_format).name.keep(),
                pl.col("account_amount")
                .str.replace("€", "")
                .str.strip()
                .str.replace(r"\.", "")
                .str.replace(",", "")
                .cast(pl.Int64)
                .abs()
                .name.keep(),
                pl.col("spending_amount").str.extract(r"([A-Z]{3}|€)$").replace("€", "EUR").alias("spending_currency"),
                pl.col("spending_amount")
                .str.replace(r"([A-Z]{3}|€)$", "")
                .str.strip()
                .str.replace(r"\.", "")
                .str.replace(",", "")
                .cast(pl.Int64)
                .abs()
                .name.keep(),
                # pl.col('title').str.extract(r'^(.*?)\s{2,}').name.keep(),
                pl.when(pl.col("type") == "Gutschrift").then(pl.lit("CREDIT")).otherwise(pl.lit("DEBIT")).name.keep(),
            ]
        )

        df = df.with_columns(
            [
                (pl.col("spending_amount") / pl.col("account_amount")).alias("spending_account_rate"),
                pl.col("account_amount").alias("user_amount"),
                pl.col("account_currency").alias("user_currency"),
            ]
        )

        return df
