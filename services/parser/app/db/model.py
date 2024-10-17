from sqlalchemy import Column, String

from .client import Base


class Transaction(Base):
    __tablename__ = "transaction"
    __abstract__ = True

    id = Column(String, primary_key=True)
    userId = Column(String)
    key = Column(String)
