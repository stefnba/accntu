import typing as t

from pydantic import BaseModel

ParserIds = t.Literal["BARCLAYS_DE_CREDITCARD", "UBS_CH_CREDITCARD", "UBS_CH_ACCOUNT"]


class ParseFile(BaseModel):
    url: str
    id: str


class ParseBody(BaseModel):
    file: list[ParseFile]
    parser_id: ParserIds
    user_id: str
