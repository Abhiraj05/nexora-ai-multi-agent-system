# from datetime import datetime, timezone
# from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
# from db.db_connection import Base


# class PasswordResetCode(Base):
#     __tablename__ = "password_reset_codes"

#     id = Column(Integer, primary_key=True, nullable=False)
#     user_id = Column(
#         Integer,
#         ForeignKey("users.id", ondelete="CASCADE"),
#         unique=True,
#         nullable=False,
#     )
#     otp_hash = Column(String(255), nullable=False)
#     reset_token_hash = Column(String(255), nullable=True)
#     expires_at = Column(DateTime(timezone=True), nullable=False)
#     verified_at = Column(DateTime(timezone=True), nullable=True)
#     attempts = Column(Integer, nullable=False, default=0)
#     created_at = Column(
#         DateTime(timezone=True),
#         nullable=False,
#         default=lambda: datetime.now(timezone.utc),
#     )
