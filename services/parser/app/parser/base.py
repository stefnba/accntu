import logging
import typing as t
from pathlib import Path
from urllib.parse import urlparse

import boto3
import polars as pl

from app.config import settings
from app.type import ParseFile
from app.utils.duckdb import SQL, DuckDB


class ParseException(Exception):
    pass


SQL_QUERY = {
    "key": SQL("sql/key.sql"),
    "duplicate": SQL("sql/duplicate.sql"),
}

s3_client = boto3.client(
    "s3",
    region_name=settings.cloud_storage.region,
    aws_access_key_id=settings.cloud_storage.access_key,
    aws_secret_access_key=settings.cloud_storage.secret_key,
)


class BaseParser:
    file_id: str

    df_raw: pl.DataFrame
    date_format: str

    key_cols: t.List[str]

    final_cols = [
        "date",
        "title",
        "country",
        "type",
        "account_amount",
        "spending_amount",
        "account_currency",
        "spending_currency",
        "spending_account_rate",
        "key",
    ]

    def add_key(self):
        """Add hashed key column to uniquely identify a transaction."""

        df = self.df_raw

        df = df.with_columns([pl.concat_str([pl.col(col) for col in self.key_cols], separator="_").alias("key")])

        self.df_raw = DuckDB.query(SQL_QUERY["key"], data=df)

    def validate(self, df: pl.DataFrame):
        """Check all required columns are present."""

        if set(df.columns) != set(self.final_cols):
            raise ParseException("Columns not identical")

    def parse(self, file: ParseFile) -> pl.DataFrame:
        """Start parsing a transaction file."""

        self.file_id = file.id

        print(f"Started parsing file '{file.id}' located at '{file.url}'.")

        # read file and store in self.df_raw
        self._read_file(path=file.url)

        # add key
        self.add_key()

        # transform data
        transformed_df = self.transform(self.df_raw)

        self.validate(transformed_df)

        return transformed_df.with_columns([pl.lit(self.file_id).alias("file_id")])

        # return transformed_df.sort("date", "type", "title", descending=[True, False, False]).to_dicts()

    def transform(self, df: pl.DataFrame) -> pl.DataFrame:
        raise NotImplementedError

    def _read_file(self, path: str):
        logging.info(f"Reading file '{path}'.")
        try:
            self.df_raw = self.read_file(path=path)
        except Exception as e:

            logging.error(f"Error reading file '{self.file_id}': {e}")

    def read_file(self, path: str) -> pl.DataFrame:
        raise NotImplementedError

    def _read_local_file(self, path: str) -> bytes:
        """
        Read file from local storage.
        """
        return Path(path).read_bytes()

    def _read_cloud_file(self, url: str) -> bytes:
        """
        Read file from S3.
        """

        parsed_url = urlparse(url)
        if parsed_url.netloc:
            key = parsed_url.path.strip("/")
        else:
            key = url.strip("/")

        bucket = settings.cloud_storage.bucket_name

        logging.info(f"Reading file from S3: {bucket}/{key}")
        response = s3_client.get_object(Bucket=bucket, Key=key)

        return t.cast(bytes, response["Body"].read())
