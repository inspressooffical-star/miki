from sqlalchemy import Column, Integer, String, DateTime, Date, Time, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Fortune(Base):
    """Fortune model for storing fortune analysis results."""
    __tablename__ = "fortunes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    birth_date = Column(Date, nullable=False)
    birth_time = Column(Time, nullable=True)
    gender = Column(String(10), nullable=False)  # M, F
    
    # Fortune analysis results
    heavenly_stem = Column(String(50), nullable=False)  # 천간
    earthly_branch = Column(String(50), nullable=False)  # 지지
    five_elements = Column(JSON, nullable=False)  # 오행
    personality = Column(Text, nullable=True)
    
    # Additional info
    lucky_color = Column(String(7), nullable=True)  # Hex color
    lucky_number = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="fortunes")
    daily_fortunes = relationship("DailyFortune", back_populates="fortune", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Fortune(id={self.id}, user_id={self.user_id}, birth_date={self.birth_date})>"


class DailyFortune(Base):
    """Daily fortune results for a specific date."""
    __tablename__ = "daily_fortunes"

    id = Column(Integer, primary_key=True, index=True)
    fortune_id = Column(Integer, ForeignKey("fortunes.id", ondelete="CASCADE"), nullable=False)
    fortune_date = Column(Date, nullable=False)
    
    # Luck ratings (1-10)
    overall_luck = Column(Integer, default=5, nullable=False)
    health = Column(Integer, default=5, nullable=False)
    love = Column(Integer, default=5, nullable=False)
    wealth = Column(Integer, default=5, nullable=False)
    work = Column(Integer, default=5, nullable=False)
    
    fortune_text = Column(Text, nullable=True)
    lucky_color = Column(String(7), nullable=True)
    lucky_number = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    fortune = relationship("Fortune", back_populates="daily_fortunes")

    def __repr__(self):
        return f"<DailyFortune(id={self.id}, fortune_id={self.fortune_id}, date={self.fortune_date})>"
