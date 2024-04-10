from sqlalchemy.orm import Session

from app.db import model


def get_transactions(db: Session, user_id: str):
    """List keys for all transactions for a user."""
    return db.query(model.Transaction).filter(model.Transaction.userId == user_id).all()
