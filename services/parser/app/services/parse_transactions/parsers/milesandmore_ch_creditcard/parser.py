from io import BytesIO

import pandas as pd
import polars as pl

from app.services.parse_transactions.parsers.base import BaseParser


class MilesAndMoreChCreditCardParser(BaseParser):

    date_format = "%d.%m.%Y"
    default_currency = "CHF"
    skiprows = 0

    key_cols = [
        "Transaction date",
        "Description",
        "Amount",
    ]

    def read_file(self, path: str) -> pl.DataFrame:
        """Read file from S3 with boto3 and return a DataFrame."""

        file = self._read_cloud_file(path)
        return pl.from_pandas(pd.read_excel(BytesIO(file), skiprows=self.skiprows))

    def transform(self, data: pl.DataFrame) -> pl.DataFrame:
        df = data.select(
            [
                pl.col("Buchungsdatum").alias("date"),
                pl.col("Land").alias("country"),
                pl.col("Betrag").alias("account_amount"),
                pl.col("Originalbetrag").alias("spending_amount"),
                pl.col("Beschreibung").alias("title"),
                pl.lit(self.default_currency).alias("account_currency"),
                pl.col("Typ").alias("type"),
                "key",
            ]
        ).with_columns(
            [
                pl.col("date").str.to_date(self.date_format).name.keep(),
                pl.col("account_amount").str.replace("€", "").str.strip().str.replace(r"\.", "").str.replace(",", "")
                # .cast(pl.Float64)
                # .mul(100)
                .cast(pl.Int64).abs().name.keep(),
                pl.col("spending_amount").str.extract(r"([A-Z]{3}|€)$").replace("€", "EUR").alias("spending_currency"),
                pl.col("spending_amount")
                .str.replace(r"([A-Z]{3}|€)$", "")
                .str.strip()
                .str.replace(r"\.", "")
                .str.replace(",", "")
                # .cast(pl.Float64)
                # .mul(100)
                .cast(pl.Int64).abs().name.keep(),
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


class TestBarclaysDeCreditCardParser(MilesAndMoreChCreditCardParser):
    def read_file(self, path: str) -> pl.DataFrame:
        """Read local test file"""

        file = self._read_local_file(path)

        return pl.from_pandas(pd.read_excel(BytesIO(file), skiprows=self.skiprows))
