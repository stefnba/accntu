from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.actions.parse_transactions.parse import parse_transaction_files
from app.db.client import get_db
from app.type import ParseBody

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


@router.post(
    "/new",
    tags=["new"],
    # responses={403: {"description": "Operation forbidden"}},
    status_code=status.HTTP_201_CREATED,
)
async def parse_transactions(body: ParseBody, db: Session = Depends(get_db)):
    try:
        return parse_transaction_files(body.files, body.parser_id, body.user_id, db)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail="Parsing failed")
