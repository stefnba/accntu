import polars as pl

from app.utils.duckdb import SQL, DuckDB

query = SQL("sql/duplicate.sql")


def identify_duplicates(transactions: pl.DataFrame, user_id: str) -> pl.DataFrame:
    """Identify duplicates in a DataFrame."""
    print(1111)
    return DuckDB.query(query=query, data=transactions)
