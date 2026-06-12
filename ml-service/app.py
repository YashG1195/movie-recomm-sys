from flask import Flask, request, jsonify
from flask_cors import CORS
from recommend import get_recommendations, load_data

app = Flask(__name__)
CORS(app)

# Load data on startup
try:
    load_data()
    print("Movie data and similarity matrix loaded successfully.")
except Exception as e:
    print(f"Failed to load movie data: {e}")

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "ML Service is running"})

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    title = data.get('title')
    
    if not title:
        return jsonify({"error": "Movie title is required"}), 400
        
    try:
        recommendations = get_recommendations(title)
        return jsonify({
            "base_movie": title,
            "recommendations": recommendations
        })
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 404
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
