import json
import typing as t

from pydantic import BaseModel, model_validator

ParserIds = t.Literal["BARCLAYS_DE_CREDITCARD", "UBS_CH_CREDITCARD", "UBS_CH_ACCOUNT"]


class ParseFile(BaseModel):
    url: str
    id: str

    class Config:
        extra = "ignore"


class ParseBody(BaseModel):
    """
    JSON body for parsing transactions.
    """

    files: list[ParseFile]
    parser_id: ParserIds
    user_id: str

    @model_validator(mode="before")
    @classmethod
    def validate_to_json(cls, value):
        if isinstance(value, (str, bytes)):
            return cls(**json.loads(value))
        return value
