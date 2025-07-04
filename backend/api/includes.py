from fastapi import FastAPI, APIRouter
from database import db_host, db_name, db_password, db_port, db_user, connect_to_db
import psycopg2
from dotenv import load_dotenv
import os
from pathlib import Path
from pydantic import BaseModel
from datetime import datetime, date
from utils import *

app = FastAPI()

class User(BaseModel):
	name: str
     
class WeeklySubgoals(BaseModel):
    user_id: str
    goal_id: str

class DailyGoalRequest(BaseModel):
    user_id: int
    date: str
    content: str
    deadline_hour: str = ""
    weekly_goal_id: int = None

class WeeklyGoalRequest(BaseModel):
    user_id: int
    week_start_date: str
    content: str
    deadline_date: str = ""
    
class ModifyDailyGoal(BaseModel):
    user_id: int
    goal_id: int
    
class SetOrChangeDailyDeadlineHour(BaseModel):
    user_id: int
    goal_id: int
    deadline_hour: str
    
class GetDailyGoals(BaseModel):
    user_id: int
    date: str