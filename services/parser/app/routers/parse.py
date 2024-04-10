from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.client import get_db
from app.services.parse_transactions.parse import parse_transaction_files
from app.type import ParseBody

router = APIRouter(
    prefix="/parse",
    tags=["parse"],
    responses={404: {"description": "Not found"}},
)


@router.get("/")
def test():
    return {"message": "Hello World"}


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
        return {"message": "Parsing failed"}
