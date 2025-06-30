from includes import *

router = APIRouter()

@router.post("/add-daily-goal")
def add_daily_goal(data: DailyGoalRequest):
	conn = None
	cur = None
	if data.deadline_hour == "":
		deadline_val = None
	else:
		deadline_val = data.deadline_hour
	try:
		conn = connect_to_db()
		cur = conn.cursor()
		cur.execute(
			"INSERT INTO daily_goals (user_id, date, deadline_hour, content) VALUES (%s, %s, %s, %s) RETURNING id",
			(data.user_id, data.date, deadline_val, data.content)	 
		)
		goal_id = cur.fetchone()[0]
		conn.commit()
		return {
			"success": True,
			"goal_id": goal_id,
			"deadline_hour": deadline_val,
			"message": f"daily goal for user id: {data.user_id} added"
		}
	except Exception as e:
		return {
			"success": False,
			"message": f"Failed to add daily goal to user id: {data.user_id}"
		}
	finally:
		if cur:
			cur.close()
		if conn:
			conn.close()

@router.post("/delete-daily-goal")
def delete_daily_goal(data: ModifyDailyGoal):
	conn = None
	cur = None
	try:
		conn = connect_to_db()
		cur = conn.cursor()
		cur.execute(
			"DELETE FROM daily_goals WHERE id = %s AND user_id = %s RETURNING id",
			(data.goal_id, data.user_id)
		)
		deleted = cur.fetchone()
		if not deleted:
			return {
				"success": False,
				"message": f"Goal not found"
			}
		conn.commit()
		return {
			"success": True,
			"goal_id": deleted[0],
			"message": f"goal {deleted[0]} from user_id: {data.user_id} deleted"
		}
	except Exception as e:
		return {
			"success": False,
			"message": f"Error: {str(e)}"
		}
	finally:
		if cur:
			cur.close()
		if conn:
			conn.close()
		
@router.post("/complete-daily-goal")
def complete_daily_goal(data: ModifyDailyGoal):
	conn = None
	cur = None
	try:
		conn = connect_to_db()
		cur = conn.cursor()
		cur.execute(
			"UPDATE daily_goals SET is_done = TRUE WHERE id = %s AND user_id = %s RETURNING id",
			(data.goal_id, data.user_id)
		)
		updated = cur.fetchone()
		if not updated:
			return {
				"success": False,
				"message": f"No goal updated"
			}
		conn.commit()
		return {
			"success": True,
			"goal_id": updated[0],
			"message": f"goal {updated[0]} marked as completed"
		}
	except Exception as e:
		return {
			"success": False,
			"message": f"Error: {str(e)}"
		}
	finally:
		if cur:
			cur.close()
		if conn:
			conn.close()

@router.post("/uncomplete-daily-goal")
def uncomplete_daily_goal(data: ModifyDailyGoal):
	conn = None
	cur = None
	try:
		conn = connect_to_db()
		cur = conn.cursor()
		cur.execute(
			"UPDATE daily_goals SET is_done = FALSE WHERE id = %s AND user_id = %s RETURNING id",
			(data.goal_id, data.user_id)
		)
		updated = cur.fetchone()
		if not updated:
			return {
				"success": False,
				"message": f"No goal updated"
			}
		conn.commit()
		return {
			"success": True,
			"goal_id": updated[0],
			"message": f"goal {updated[0]} marked as uncompleted"
		}
	except Exception as e:
		return {
			"success": False,
			"message": f"Error: {str(e)}"
		}
	finally:
		if cur:
			cur.close()
		if conn:
			conn.close()

@router.post("/set-or-change-deadline-hour-for-daily-goal")
def set_or_change_deadline_hour(data: SetOrChangeDailyDeadlineHour):
	cur = None
	conn = None
	try:
		conn = connect_to_db()
		cur = conn.cursor()
		cur.execute(
			"UPDATE daily_goals SET deadline_hour = %s WHERE id = %s AND user_id = %s RETURNING id",
			(data.deadline_hour, data.goal_id, data.user_id)
		)
		updated = cur.fetchone()
		if not updated:
			return {
				"success": False,
				"message": f"cannot set or change deadline_hour"
			}
		conn.commit()
		return {
			"success": True,
			"goal_id": data.goal_id,
			"new deadline hour": data.deadline_hour,
			"message": f"deadline hour setup"
		}
	except Exception as e:
		return {
			"success": False,
			"message": f"Error: {str(e)}"
		}
	finally:
		if cur:
			cur.close()
		if conn:
			conn.close()

@router.post("/delete-deadline-hour-for-daily-goal")
def delete_deadline_hour(data: ModifyDailyGoal):
	cur = None
	conn = None
	try:
		conn = connect_to_db()
		cur = conn.cursor()
		cur.execute(
			"UPDATE daily_goals SET deadline_hour = %s WHERE id = %s AND user_id = %s RETURNING id",
			("", data.goal_id, data.user_id)
		)
		updated = cur.fetchone()
		if not updated:
			return {
				"success": False,
				"message": f"cannot set or change deadline_hour"
			}
		conn.commit()
		return {
			"success": True,
			"goal_id": data.goal_id,
			"message": f"deadline hour deleted"
		}
	except Exception as e:
		return {
			"success": False,
			"message": f"Error: {str(e)}"
		}
	finally:
		if cur:
			cur.close()
		if conn:
			conn.close()

@router.get("/get-daily-goals")
def get_daily_goals(user_id: int, date: str):
	conn = None
	cur = None
	try:
		conn = connect_to_db()
		cur = conn.cursor()
		cur.execute(
			"SELECT * FROM daily_goals WHERE user_id = %s AND date = %s",
			(user_id, date)
		)
		return fetch_all_as_dict(cur)
	except Exception as e:
		return {
			"success": False,
			"message": f"Wrong user_id or date"
		}
	finally:
		if cur:
			cur.close()
		if conn:
			conn.close()

@router.get("/get-all-goals")
def get_all_goals(user_id: int):
	conn = None
	cur = None
	try:
		conn = connect_to_db()
		cur = conn.cursor()
		cur.execute(
			"SELECT * FROM daily_goals WHERE user_id = %s",
			(user_id,)
		)
		return fetch_all_as_dict(cur)
	except Exception as e:
		return {
			"success": False,
			"message": f"Failed to get all goals from user_id: {user_id}"
		}
	finally:
		if cur:
			cur.close()
		if conn:
			conn.close()