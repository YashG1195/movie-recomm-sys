import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
import json

df = None
cosine_sim = None
indices = None

def load_data():
    global df, cosine_sim, indices
    
    csv_path = 'movies.csv'
    
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return
        
    print("Loading large movie dataset...")
    df = pd.read_csv(csv_path)
    
    # Parse genres and keywords
    def extract_names(x):
        try:
            data = json.loads(x)
            return " ".join([d['name'] for d in data])
        except:
            return ""

    print("Parsing genres and keywords...")
    df['genres_parsed'] = df['genres'].apply(extract_names)
    
    if 'keywords' in df.columns:
        df['keywords_parsed'] = df['keywords'].apply(extract_names)
    else:
        df['keywords_parsed'] = ""
        
    # Combine features
    df['combined_features'] = df['genres_parsed'] + " " + df['keywords_parsed'] + " " + df['overview'].fillna('')
    
    print("Computing TF-IDF Matrix...")
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df['combined_features'])
    
    print("Computing Cosine Similarity...")
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    
    indices = pd.Series(df.index, index=df['title']).drop_duplicates()
    print("ML Engine is ready!")

def get_recommendations(movie_id=None, title=None, top_n=10):
    global df, cosine_sim, indices
    
    if df is None or cosine_sim is None:
        raise ValueError("Model is not loaded yet.")
        
    idx = None
    
    if title and title in indices:
        idx = indices[title]
    elif movie_id:
        matches = df.index[df['id'] == int(movie_id)].tolist()
        if matches:
            idx = matches[0]
    
    if idx is None:
        raise ValueError(f"Movie not found in dataset.")
        
    if isinstance(idx, pd.Series):
        idx = idx.iloc[0]
        
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:top_n+1]
    
    movie_indices = [i[0] for i in sim_scores]
    
    recommendations = df.iloc[movie_indices][['id', 'title', 'genres_parsed']].rename(columns={'genres_parsed': 'genres'}).to_dict(orient='records')
    for rec in recommendations:
        rec['poster_path'] = None 
    return recommendations
