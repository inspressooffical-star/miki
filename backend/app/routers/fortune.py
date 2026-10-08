from fastapi import APIRouter, HTTPException, status
from app.schemas.fortune import FortuneAnalyzeRequest, FortuneResponse, DailyFortuneResponse
from app.services.fortune_engine import FortuneEngine

router = APIRouter(prefix="/fortune", tags=["fortune"])


@router.post("/analyze", response_model=FortuneResponse)
async def analyze_fortune(request: FortuneAnalyzeRequest):
    """
    Analyze fortune based on birth date and time.
    
    - **birth_date**: Birth date in YYYY-MM-DD format
    - **birth_time**: Birth time in HH:MM:SS format (optional)
    - **gender**: M (Male) or F (Female)
    """
    try:
        engine = FortuneEngine()
        result = engine.analyze_fortune(
            birth_date=request.birth_date,
            birth_time=request.birth_time,
            gender=request.gender
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/daily", response_model=DailyFortuneResponse)
async def get_daily_fortune(fortune_id: int, date: str = None):
    """
    Get daily fortune for a specific date.
    
    - **fortune_id**: ID of the fortune analysis
    - **date**: Date in YYYY-MM-DD format (optional, defaults to today)
    """
    try:
        engine = FortuneEngine()
        result = engine.get_daily_fortune(fortune_id, date)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/monthly")
async def get_monthly_fortune(fortune_id: int, month: str = None):
    """
    Get monthly fortune.
    
    - **fortune_id**: ID of the fortune analysis
    - **month**: Month in YYYY-MM format (optional, defaults to current month)
    """
    try:
        engine = FortuneEngine()
        result = engine.get_monthly_fortune(fortune_id, month)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/yearly")
async def get_yearly_fortune(fortune_id: int, year: str = None):
    """
    Get yearly fortune.
    
    - **fortune_id**: ID of the fortune analysis
    - **year**: Year in YYYY format (optional, defaults to current year)
    """
    try:
        engine = FortuneEngine()
        result = engine.get_yearly_fortune(fortune_id, year)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
