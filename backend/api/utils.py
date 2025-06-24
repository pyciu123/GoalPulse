from includes import *

def fetch_all_as_dict(cur):
	columns = []
	for description in cur.description:
		column_name = description[0]
		columns.append(column_name)
	results = []
	for row in cur.fetchall():
		row_dict = dict(zip(columns, row))
		results.append(row_dict)
	return results