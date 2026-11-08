from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.db_connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    reports = relationship(
        "Report",
        back_populates="user",
        cascade="all, delete-orphan",
    )