from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import traceback
import re

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin requests

# Load model and vectorizer
try:
    with open("model.pkl", "rb") as f:
        model = pickle.load(f)
    with open("tfidf.pkl", "rb") as f:
        tfidf = pickle.load(f)
except Exception as e:
    print("❌ Error loading model/vectorizer:", e)
    traceback.print_exc()
    exit(1)

# Text cleaning function (same used during training)
def clean_text(text):
    text = text.lower()
    text = re.sub(r'\W+', ' ', text)
    return text.strip()

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "✅ Spam Detection API is running!"}), 200

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        email_text = data.get("email", "").strip()

        if not email_text:
            return jsonify({"error": "Email content is required"}), 400

        # Preprocess and vectorize
        cleaned = clean_text(email_text)
        transformed = tfidf.transform([cleaned])
        prediction = model.predict(transformed)[0]
        confidence = model.predict_proba(transformed)[0][prediction]

        return jsonify({
            "isSpam": bool(prediction),
            "confidence": round(confidence * 100, 2),
            "message": "Spam" if prediction else "Not Spam"
        }), 200

    except Exception as e:
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500

# Run the app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
