import logging
import re
import typing as t
from pathlib import Path
from urllib.parse import urlparse

import boto3
import polars as pl
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.actions.parse_transactions.types import TransformedTransaction
from app.config import settings
from app.db.query.transaction import get_transactions
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

    def parse(self, file_uri: str, file_id: str) -> pl.DataFrame:
        """
        Entry point to parse a transaction file either from cloud storage (if starting with 's3://')
        or local storage (if starting with 'file://').
        """

        file_content: bytes | None = None

        if file_uri.startswith("s3://") or re.search(
            r"^https:\/\/[a-z0-9.-]+\.s3\.[a-z0-9-]+\.amazonaws\.com\/[a-f0-9]+$", file_uri
        ):
            file_content = self._read_s3_file(file_uri)

        if file_uri.startswith("file://") or Path(file_uri).exists():
            file_content = self._read_local_file(file_uri)

        if file_content is None:
            raise ParseException(f"Invalid file URI: {file_uri}")

        # todo loggin
        print(f"Started parsing file '{file_id}' located at '{file_uri}'.")
        df = self.read_into_df(file_content)

        # add key. Needs to be done before transforming data.
        df = self.add_key(df=df)

        # transform data
        try:
            df = self.transform(df=df)
        except Exception as e:
            # todo logging
            print(f"Error transforming data: {e}")
            raise ParseException(f"Error transforming data: {e}")

        # get first 5 rows to check if transformation was successful
        [TransformedTransaction(**row) for row in df.head(5).to_dicts()]

        # add file_id
        df = self.add_file_id(df=df, file_id=file_id)

        return df

    def add_key(self, df: pl.DataFrame) -> pl.DataFrame:
        """
        Add hashed key column to uniquely identify a transaction.
        """

        df = df.with_columns(
            [
                pl.concat_str([pl.col(col) for col in self.key_cols], separator="_").alias("key"),
            ]
        )
        return DuckDB.query(SQL_QUERY["key"], data=df)

    def add_file_id(self, df: pl.DataFrame, file_id: str) -> pl.DataFrame:
        """
        Add file_id column to identify the source of the transaction.
        """
        return df.with_columns([pl.lit(file_id).alias("file_id")])

    def transform(self, df: pl.DataFrame) -> pl.DataFrame:
        """
        Main transformation logic. Implemented in child class.
        """

        raise NotImplementedError

    def read_into_df(self, content: bytes) -> pl.DataFrame:
        """
        Implementation done in child classes.
        """

        raise NotImplementedError

    def _read_local_file(self, path: str) -> bytes:
        """
        Read file from local storage.
        """
        logging.info(f"Reading local file located at '{path}'.")
        return Path(path).read_bytes()

    def _read_s3_file(self, file_uri: str) -> bytes:
        """
        Read file from S3.
        """

        try:

            parsed_url = urlparse(file_uri)
            if parsed_url.netloc:
                key = parsed_url.path.strip("/")
            else:
                key = file_uri.strip("/")

            bucket = settings.cloud_storage.bucket_name

            logging.info(f"Reading file from S3: {bucket}/{key}")
            response = s3_client.get_object(Bucket=bucket, Key=key)

            return t.cast(bytes, response["Body"].read())

        except Exception as e:
            logging.error(f"Error reading file from S3: {e}")
            raise e

    @staticmethod
    def identify_duplicates(transactions: pl.DataFrame, user_id: str, db: Session) -> pl.DataFrame:
        """Identify duplicate transactions."""

        existing_transactions = pl.DataFrame(
            jsonable_encoder(get_transactions(user_id=user_id, db=db)),
            schema={
                "userId": pl.Utf8,
                "key": pl.Utf8,
                "id": pl.Utf8,
            },
        )

        data = DuckDB.query(
            query=SQL_QUERY["duplicate"], data=transactions, existing_transactions=existing_transactions
        )

        return data
