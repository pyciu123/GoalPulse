import os
from pathlib import Path
from dotenv import load_dotenv
import psycopg2

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_name = os.getenv("DB_NAME")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")

def connect_to_db():
	try:
		conn = psycopg2.connect(
			host=db_host,
			port=db_port,
			database=db_name,
			user=db_user,
			password=db_password
			)
		return conn
	except Exception as e:
		print("❌ DB ERROR:", e)
		raise