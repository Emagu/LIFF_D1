CREATE TABLE employees (
     id INTEGER PRIMARY KEY AUTOINCREMENT,    
	 name TEXT NOT NULL, 	
	 line_id text,     
	 status text,
	 created_at TEXT DEFAULT CURRENT_TIMESTAMP
	 )