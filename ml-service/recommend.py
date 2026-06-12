import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

df = None
cosine_sim = None
indices = None

def load_data():
    global df, cosine_sim, indices
    
    csv_path = 'movies_sample.csv'
    
    # If sample dataset doesn't exist, create a tiny one to bootstrap
    if not os.path.exists(csv_path):
        data = {
            'id': [1, 2, 3, 4, 5],
            'title': ['Inception', 'Interstellar', 'The Dark Knight', 'Avengers', 'Iron Man'],
            'genres': ['Action Sci-Fi Thriller', 'Adventure Drama Sci-Fi', 'Action Crime Drama', 'Action Sci-Fi', 'Action Sci-Fi'],
            'overview': [
                'A thief who steals corporate secrets through the use of dream-sharing technology.',
                'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
                'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham.',
                'Earth\'s mightiest heroes must come together and learn to fight as a team.',
                'After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor.'
            ]
        }
        df = pd.DataFrame(data)
        df.to_csv(csv_path, index=False)
    else:
        df = pd.read_csv(csv_path)

    # We will combine genres and overview to form a single text soup for content based filtering
    df['combined_features'] = df['genres'] + " " + df['overview']

    # Initialize TF-IDF Vectorizer
    tfidf = TfidfVectorizer(stop_words='english')

    # Fit and transform the data
    tfidf_matrix = tfidf.fit_transform(df['combined_features'].fillna(''))

    # Compute cosine similarity
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    # Create a pandas series to map titles to indices
    indices = pd.Series(df.index, index=df['title']).drop_duplicates()

def get_recommendations(movie_id=None, title=None, top_n=10):
    global df, cosine_sim, indices
    
    idx = None
    
    # Try finding by title first if provided
    if title and title in indices:
        idx = indices[title]
    
    # In a real app we'd map movie_id to the row index, but since we are using 
    # a dummy dataset of 5 movies, it's highly likely the TMDB ID won't match.
    # So if we don't have it, we'll return some fallback recommendations to avoid breaking the UI.
    
    if idx is None:
        # Fallback recommendations if movie not in our small dataset
        recommendations = df.head(top_n)[['id', 'title', 'genres']].to_dict(orient='records')
        # We simulate poster_path to null, or the frontend handles it
        for rec in recommendations:
            rec['poster_path'] = None
        return recommendations
        
    # If there are duplicate titles, take the first one
    if isinstance(idx, pd.Series):
        idx = idx.iloc[0]
        
    # Get pairwise similarity scores
    sim_scores = list(enumerate(cosine_sim[idx]))
    
    # Sort movies based on similarity scores
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    # Get top N similar movies (excluding itself)
    sim_scores = sim_scores[1:top_n+1]
    
    # Get movie indices
    movie_indices = [i[0] for i in sim_scores]
    
    # Return top N most similar movies
    recommendations = df.iloc[movie_indices][['id', 'title', 'genres']].to_dict(orient='records')
    for rec in recommendations:
        rec['poster_path'] = None # Mock dataset doesn't have posters
    return recommendations
    

