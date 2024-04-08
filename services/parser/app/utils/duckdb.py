import typing as t
from pathlib import Path
from string import Template

import duckdb
import pandas as pd
import polars as pl

Bindings: t.TypeAlias = pl.DataFrame | pd.DataFrame

BASE_PATH = "app/parser"


class SQL:
    sql: str
    bindings: t.Mapping[str, Bindings]

    def __init__(self, sql: str, **bindings: Bindings):
        self.bindings = bindings

        if sql.endswith(".sql"):
            self.sql = Path(BASE_PATH, sql).read_text()
        else:
            self.sql = sql


class DuckDB:

    duck: duckdb.DuckDBPyConnection

    def __init__(self):
        self.duck = duckdb.connect(database=":memory:")

    def collect_dataframes(self, bindings: t.Mapping[str, Bindings]) -> t.Mapping[str, Bindings]:
        dataframes: t.Mapping[str, Bindings] = {}

        for value in bindings.values():
            if isinstance(value, (pd.DataFrame, pl.DataFrame)):
                dataframes[self._get_dataframe_key(value)] = value

        return dataframes

    def _get_dataframe_key(self, value: Bindings) -> str:
        """Helper func to return the ID of the specified dataframe."""
        return f"df_{id(value)}"

    def register_dataframes(self, dataframes: t.Mapping[str, Bindings]):
        """Register a dataframe as a DuckDB view."""
        for key, value in dataframes.items():
            self.duck.register(key, value)

    def sql_to_string(self, sql: SQL) -> str:
        """Transform query into executable query string."""

        replacements = {}

        for key, value in sql.bindings.items():
            if isinstance(value, (pd.DataFrame, pl.DataFrame)):
                replacements[key] = self._get_dataframe_key(value)
            elif isinstance(value, str):
                replacements[key] = f"'{value}'"
            elif isinstance(value, (int, float, bool)):
                replacements[key] = str(value)
            elif value is None:
                replacements[key] = "NULL"
            else:
                raise ValueError(f"Invalid type for {key}")

        return Template(sql.sql).safe_substitute(replacements)

    def _query(self, sql: str | SQL, **bindings: Bindings) -> duckdb.DuckDBPyConnection:
        """Helper method to parse query, register dataframes and execute query."""

        if isinstance(sql, SQL):
            sql = SQL(sql.sql, **sql.bindings, **bindings)
        elif isinstance(sql, str):
            sql = SQL(sql, **bindings)

        dataframes = self.collect_dataframes(sql.bindings)
        self.register_dataframes(dataframes)

        query = self.sql_to_string(sql)

        return self.duck.execute(query)

    @classmethod
    def query(cls, query: str | SQL, **bindings: Bindings) -> pl.DataFrame:
        """Entry method to instantiate a DuckDB class, directly execute a query and return a polars dataframe."""
        q = cls()
        return q._query(query, **bindings).pl()
