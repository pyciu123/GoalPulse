from includes import *

router = APIRouter()

@router.post("/add-weekly-goal")
def add_weekly_goal(data: WeeklyGoalRequest):
	conn = None
	cur = None
	if data.deadline_date == "":
		deadline_val = None
	else:
		deadline_val = data.deadline_date
	try:
		conn = connect_to_db()
		cur = conn.cursor()
		cur.execute(
			"INSERT INTO weekly_goals (user_id, week_start_date, deadline_date, content) VALUES (%s, %s, %s, %s) RETURNING id",
			(data.user_id, data.week_start_date, deadline_val, data.content)	 
		)
		goal_id = cur.fetchone()[0]
		conn.commit()
		return {
			"success": True,
			"goal_id": goal_id,
			"message": f"weekly goal for user id: {data.user_id} added"
		}
	except Exception as e:
		return {
			"success": False,
			"message": f"Failed to add weekly goal to user id: {data.user_id}"
		}
	finally:
		if cur:
			cur.close()
		if conn:
			conn.close()

@router.post("/delete-weekly-goal")
def delete_weekly_goal(data: ModifyDailyGoal):
	conn = None
	cur = None
	try:
		conn = connect_to_db()
		cur = conn.cursor()
		cur.execute(
			"DELETE FROM daily_goals WHERE weekly_goal_id = %s",
			(data.goal_id,)
		)
		cur.execute(
			"DELETE FROM weekly_goals WHERE id = %s AND user_id = %s RETURNING id",
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

@router.get("/get-weekly-goal-subgoals")
def get_subgoals(user_id: int, goal_id: int):
	conn = None
	cur = None
	try:
		conn = connect_to_db()
		cur = conn.cursor()
		cur.execute(
			"SELECT * FROM daily_goals WHERE user_id = %s and weekly_goal_id = %s",
			(user_id, goal_id)
		)
		return fetch_all_as_dict(cur)
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
		
@router.post("/complete-weekly-goal")
def complete_weekly_goal(data: ModifyDailyGoal):
	conn = None
	cur = None
	try:
		conn = connect_to_db()
		cur = conn.cursor()
		cur.execute(
			"UPDATE weekly_goals SET is_done = TRUE WHERE id = %s AND user_id = %s RETURNING id",
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

@router.post("/uncomplete-weekly-goal")
def uncomplete_weekly_goal(data: ModifyDailyGoal):
	conn = None
	cur = None
	try:
		conn = connect_to_db()
		cur = conn.cursor()
		cur.execute(
			"UPDATE weekly_goals SET is_done = FALSE WHERE id = %s AND user_id = %s RETURNING id",
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

@router.post("/set-or-change-deadline-hour-for-weekly-goal")
def set_or_change_deadline_date(data: SetOrChangeDailyDeadlineHour):
	cur = None
	conn = None
	try:
		conn = connect_to_db()
		cur = conn.cursor()
		cur.execute(
			"UPDATE weekly_goals SET deadline_date = %s WHERE id = %s AND user_id = %s RETURNING id",
			(data.deadline_hour, data.goal_id, data.user_id)
		)
		updated = cur.fetchone()
		if not updated:
			return {
				"success": False,
				"message": f"cannot set or change deadline_date"
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

@router.post("/delete-deadline-hour-for-weekly-goal")
def delete_deadline_date(data: ModifyDailyGoal):
	cur = None
	conn = None
	try:
		conn = connect_to_db()
		cur = conn.cursor()
		cur.execute(
			"UPDATE weekly_goals SET deadline_date = %s WHERE id = %s AND user_id = %s RETURNING id",
			("", data.goal_id, data.user_id)
		)
		updated = cur.fetchone()
		if not updated:
			return {
				"success": False,
				"message": f"cannot set or change deadline_date"
			}
		conn.commit()
		return {
			"success": True,
			"goal_id": data.goal_id,
			"message": f"deadline date deleted"
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

@router.get("/get-weekly-goals")
def get_weekly_goals(user_id: int, date: str):
	conn = None
	cur = None
	try:
		conn = connect_to_db()
		cur = conn.cursor()
		cur.execute(
			"SELECT * FROM weekly_goals WHERE user_id = %s AND week_start_date = %s",
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
			"SELECT * FROM weekly_goals WHERE user_id = %s",
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