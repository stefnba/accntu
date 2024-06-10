import typing as t
from datetime import date as Date

from pydantic import BaseModel

ParserIds = t.Literal["BARCLAYS_DE_CREDITCARD", "UBS_CH_CREDITCARD", "UBS_CH_ACCOUNT", "MILESANDMORE_CH_CREDITCARD"]


class ParseFile(BaseModel):
    url: str
    id: str

    class Config:
        extra = "ignore"


class TransformedTransaction(BaseModel):
    date: Date
    country: str | None
    account_amount: int
    spending_amount: int
    title: str
    account_currency: str
    type: str  # todo: enum
    key: str
    spending_currency: str
    spending_account_rate: float
    user_amount: int
    user_currency: str


class ParsedTransaction(TransformedTransaction):

    file_id: str
    is_duplicate: bool
