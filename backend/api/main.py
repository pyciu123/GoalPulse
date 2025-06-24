from includes import *
from routers import daily_goals, weekly_goals, users

app.include_router(daily_goals.router)
app.include_router(users.router)
app.include_router(weekly_goals.router)