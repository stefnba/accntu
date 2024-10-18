from fastapi import FastAPI, Request, Response, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import parse

app = FastAPI()

######
# Routers
######
app.include_router(parse.router)


######
# Middleware
######
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://accntu.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


######
# Exception
######
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
    return Response(content="Server running...", status_code=200)
