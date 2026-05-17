from db import get_connection


connection = get_connection()

cursor = connection.cursor()

# AI request history table

cursor.execute("""
CREATE TABLE IF NOT EXISTS ai_requests (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    api_name TEXT,

    software TEXT,

    patch_status TEXT,

    response TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# Report history table

cursor.execute("""
CREATE TABLE IF NOT EXISTS reports (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    software TEXT,

    patch_status TEXT,

    file_name TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

connection.commit()

connection.close()

print("Database initialized successfully")