from pydantic import BaseModel


class Transaction(BaseModel):
    id: str
    userId: str
    key: str

    class Config:
        orm_mode = True
