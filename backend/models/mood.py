from database import db

class Mood(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    mood = db.Column(db.String(20))  # happy, sad, etc.
    