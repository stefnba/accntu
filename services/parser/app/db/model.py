from sqlalchemy import Column, String
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class Transaction(Base):
    __tablename__ = "transaction"

    id = Column(String, primary_key=True)
    userId = Column(String)
    key = Column(String)
    title = Column(String)

    def __repr__(self) -> str:
        return f"Transaction(id={self.id!r}, title={self.title!r})"
