from includes import *

router = APIRouter()

@router.post("/add-user")
def add_user(data: User):
	conn = connect_to_db()
	cur = conn.cursor()
	cur.execute("SELECT * FROM users WHERE user_name = %s", (data.name,))
	if cur.fetchall():
		return {"error:" f"user {data.name} already exist"}
	cur.execute("INSERT INTO users (user_name) VALUES (%s)", (data.name,))
	conn.commit()
	res = {"status": "success"}
	cur.close()
	conn.close()
	return res

@router.get("/get-all-users")
def get_all_users():
	conn = connect_to_db()
	cur = conn.cursor()
	try:
		cur.execute("SELECT user_id, user_name FROM users")
		users = fetch_all_as_dict(cur)
		return users
	finally:
		cur.close()
		conn.close()

@router.post("/check-if-user-in-db")
def check_user(data: User):
	conn = connect_to_db()
	cur = conn.cursor()
	cur.execute("SELECT user_id FROM Users WHERE user_name = %s", (data.name,))
	row = cur.fetchone()
	if (row):
		res =  {
			"status": "success",
			"user_id": row[0]
			}
	else:
		res =  {"status": "failed",}
	cur.close()
	conn.close()
	return res