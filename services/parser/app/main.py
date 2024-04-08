import concurrent.futures

import polars as pl
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.duplicate import identify_duplicates
from app.parser.parse import parsers
from app.type import ParseBody, ParseFile, ParserIds

app = FastAPI()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    try:
        exception = exc.errors()[0]
        field = exception.get("loc")[-1]
        msg = exception.get("msg")

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=jsonable_encoder({"detail": "Payload not valid", "field": field, "msg": msg}),
        )
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=jsonable_encoder({"detail": exc.errors()}),
        )


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/parsers")
def list_parser():
    return [
        {"name": "parser1", "version": "1.0.0"},
    ]


def parse_transactions(file: ParseFile, parser_id: ParserIds) -> pl.DataFrame:
    parser = parsers[parser_id]()
    return parser.parse(file)


@app.post("/parse", status_code=status.HTTP_201_CREATED)
def parse(body: ParseBody):

    if body.parser_id not in parsers:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parser not found")

    try:
        files = body.file
        file_ids = [file.id for file in files]

        print(file_ids)
        user_id = body.user_id
        parsed_dfs: list[pl.DataFrame] = []

        # parse transactions in parallel
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = [executor.submit(parse_transactions, file, body.parser_id) for file in files]
        for future in concurrent.futures.as_completed(futures):
            result = future.result()

            parsed_dfs.append(result)

        parsed_df = pl.concat(parsed_dfs).sort("date", "type", "title", descending=[True, False, False])

        # combine transactions and check for duplicates
        unique_df = identify_duplicates(transactions=parsed_df, user_id=user_id)

        return {file_id: unique_df.filter(pl.col("file_id") == file_id).to_dicts() for file_id in file_ids}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
