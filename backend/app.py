from flask import Flask, request, jsonify
from flask_cors import CORS
from database import db


# Import models
from models import User, Transaction, Mood

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///moodwealth.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# HOME ROUTE
@app.route('/')
def home():
    return {"message": "MoodWealth Backend Running 🚀"}

# ADD TRANSACTION
@app.route('/add-transaction', methods=['POST'])
def add_transaction():
    data = request.json

    new_txn = Transaction(
        amount=data['amount'],
        category=data['category'],
        type=data['type'],
        mood=data.get('mood'),
        user_id=data.get('user_id')
    )

    db.session.add(new_txn)
    db.session.commit()

    return jsonify({"message": "Transaction added successfully ✅"})

#  GET TRANSACTIONS
@app.route('/get-transactions', methods=['GET'])
def get_transactions():
    user_id = request.args.get('user_id')
    transactions = Transaction.query.filter_by(user_id=user_id).all()
    
    result = []
    for txn in transactions:
        result.append({
            "id": txn.id,
            "amount": txn.amount,
            "category": txn.category,
            "type": txn.type,
            "mood": txn.mood,
            "date": txn.date
        })
        
    return jsonify(result)

# REGISTER API
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    existing_user = User.query.filter_by(username=data['username']).first()

    if existing_user:
        return jsonify({"message": "Username already exists ❌"}), 400

    user = User(
        username=data['username'],
        password=data['password']
    )

    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User registered ✅"})


# LOGIN API
@app.route('/login', methods=['POST'])
def login():
    data = request.json

    user = User.query.filter_by(username=data['username']).first()

    if user and user.password == data['password']:
        return jsonify({"message": "Login success ✅", "user_id": user.id})
    
    return jsonify({"message": "If a new user, please register first !!"}), 401


# RUN APP
if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)