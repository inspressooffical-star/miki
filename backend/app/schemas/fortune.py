from pydantic import BaseModel, Field
from datetime import datetime, date, time
from typing import Optional, Dict


class FortuneAnalyzeRequest(BaseModel):
    """Fortune analysis request schema."""
    birth_date: date = Field(..., description="Birth date in YYYY-MM-DD format")
    birth_time: Optional[time] = Field(None, description="Birth time in HH:MM:SS format")
    gender: str = Field(..., pattern="^[MF]$", description="Gender: M or F")

    class Config:
        json_schema_extra = {
            "example": {
                "birth_date": "1990-01-15",
                "birth_time": "14:30:00",
                "gender": "M"
            }
        }


class FortuneResponse(BaseModel):
    """Fortune analysis response schema."""
    id: int
    birth_date: date
    birth_time: Optional[time]
    gender: str
    heavenly_stem: str
    earthly_branch: str
    five_elements: Dict[str, int]
    personality: Optional[str]
    lucky_color: Optional[str]
    lucky_number: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class DailyFortuneResponse(BaseModel):
    """Daily fortune response schema."""
    date: date
    overall_luck: int
    health: int
    love: int
    wealth: int
    work: int
    fortune_text: Optional[str]
    lucky_color: Optional[str]
    lucky_number: Optional[int]

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "date": "2024-01-15",
                "overall_luck": 7,
                "health": 8,
                "love": 6,
                "wealth": 7,
                "work": 8,
                "fortune_text": "오늘은 긍정적인 에너지의 날입니다...",
                "lucky_color": "#FF6B6B",
                "lucky_number": 7
            }
        }


class MonthlyFortuneResponse(BaseModel):
    """Monthly fortune response schema."""
    month: str
    overall_luck: int
    health: int
    love: int
    wealth: int
    work: int
    forecast: Optional[str]
    key_dates: list = []

    class Config:
        from_attributes = True


class YearlyFortuneResponse(BaseModel):
    """Yearly fortune response schema."""
    year: str
    overall_luck: int
    health: int
    love: int
    wealth: int
    work: int
    yearly_theme: Optional[str]
    quarterly_forecast: list = []

    class Config:
        from_attributes = True
