from database import db
from datetime import datetime

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float)
    category = db.Column(db.String(50))
    type = db.Column(db.String(10))  # income / expense
    mood = db.Column(db.String(20))
    user_id = db.Column(db.Integer)
    date = db.Column(db.DateTime, default=datetime.utcnow)