import json
import typing as t

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, model_validator
from sqlalchemy.orm import Session

from app.actions.parse_transactions.parse import parse_transaction_files
from app.actions.parse_transactions.types import ParsedTransaction, ParseFile, ParserIds
from app.db.client import get_db

router = APIRouter(
    prefix="/parse",
    tags=["parse"],
    responses={404: {"description": "Not found"}},
)


class TestResponse(BaseModel):
    message: str


@router.get("/")
def test() -> TestResponse:
    return TestResponse(message="Parser service running...")


class NewParseBody(BaseModel):
    files: list[ParseFile]
    parser_id: ParserIds
    user_id: str

    @model_validator(mode="before")
    @classmethod
    def validate_to_json(cls, value):
        if isinstance(value, (str, bytes)):
            return cls(**json.loads(value))
        return value


@router.post(
    "/new",
    tags=["new"],
    # responses={403: {"description": "Operation forbidden"}},
    status_code=status.HTTP_201_CREATED,
)
async def parse_transactions(body: NewParseBody, db: Session = Depends(get_db)) -> t.List[ParsedTransaction]:
    try:
        return parse_transaction_files(
            files=body.files,
            parser_id=body.parser_id,
            user_id=body.user_id,
            db=db,
        )

    except Exception as e:
        #  todo logging
        print(e)
        raise HTTPException(status_code=400, detail="Parsing failed")
