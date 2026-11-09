from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import relationship
from db.db_connection import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    introduction = Column(Text, nullable=False)
    background = Column(Text, nullable=False)
    key_findings = Column(JSON, nullable=False)
    benefits = Column(JSON, nullable=False)
    challenges = Column(JSON, nullable=False)
    conclusion = Column(Text, nullable=False)
    references = Column(JSON, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    user = relationship("User", back_populates="reports")