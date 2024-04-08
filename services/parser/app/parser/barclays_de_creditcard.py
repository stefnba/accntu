from io import BytesIO

import pandas as pd
import polars as pl

from app.parser.base import BaseParser


class BarclasyDeCreditCardParser(BaseParser):

    date_format = "%d.%m.%Y"
    default_currency = "EUR"
    skiprows = 12

    key_cols = [
        "Buchungsdatum",
        "Beschreibung",
        "Originalbetrag",
    ]

    def read_file(self, path: str) -> pl.DataFrame:
        """Read file from S3 with boto3 and return a DataFrame."""

        # file = self.read_cloud_file(path)
        file = self._read_local_file("app/parser/Umsätze-8.xlsx")

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
                pl.col("account_amount")
                .str.replace("€", "")
                .str.strip()
                .str.replace(r"\.", "")
                .str.replace(",", ".")
                .cast(pl.Decimal)
                .abs()
                .name.keep(),
                pl.col("spending_amount").str.extract(r"([A-Z]{3}|€)$").replace("€", "EUR").alias("spending_currency"),
                pl.col("spending_amount")
                .str.replace(r"([A-Z]{3}|€)$", "")
                .str.strip()
                .str.replace(r"\.", "")
                .str.replace(",", ".")
                .cast(pl.Decimal)
                .abs()
                .name.keep(),
                # pl.col('title').str.extract(r'^(.*?)\s{2,}').name.keep(),
                pl.when(pl.col("type") == "Gutschrift").then(pl.lit("DEBIT")).otherwise(pl.lit("debit")).name.keep(),
            ]
        )

        df = df.with_columns([(pl.col("spending_amount") / pl.col("account_amount")).alias("spending_account_rate")])

        return df
