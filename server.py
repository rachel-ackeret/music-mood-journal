from flask import Flask, render_template, request, flash, redirect, session

from pprint import pformat
import os
import requests
import spotipy
from random import choice
from spotipy.oauth2 import SpotifyClientCredentials
from flask_login import LoginManager, login_user, login_required
from flask_sqlalchemy import SQLAlchemy
from model import connect_to_db, User, Entry


db = SQLAlchemy()

login_manager = LoginManager()
#Flask credentials
app = Flask(__name__)
app.secret_key = 'SECRETSECRETSECRET'

#Spotipy credentials
SPOTIPY_REDIRECT_URI='http://localhost:5000/'
auth_manager = SpotifyClientCredentials()
spotify = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials())


#base URL
url = 'https://api.spotify.com/v1/'

# HOMEPAGE for LOGIN & REGISTRATION
@app.route('/')
def homepage():
    """Show homepage."""
    return render_template('homepage.html')

#LOGIN ROUTE
@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    password = request.form.get("password")
    print(username)
    print(password)

    if User.query.filter_by(username=username).first():
        user = User.query.filter_by(username=username).first()
        if user.password == password:
            # Call flask_login.login_user to login a user
            login_user(user)
            current_user_id = User.query.filter_by(username=username).first().id
            print(current_user_id)
            session['current_user'] = current_user_id
            flash("Logged in successfully!")
            return redirect("/journal")
    print("sorry try again")
    flash("Sorry try again.")
    return redirect("/")

@app.route("/register", methods=["POST"])
def register():
    username = request.form.get('username')
    password = request.form.get('password')
    fname = request.form.get('fname')
    lname = request.form.get('lname')
    user = User(username=username, password=password, fname = fname, lname = lname)
    
    if not User.query.filter_by(username=username).first():
        db.session.add(user)
        db.session.commit()
        flash("Created User Successfully!")
        print("Created User Successfully!")
        return redirect("/")

    flash("User already Created.")
    print("User already Created.")
    return redirect("/")


@app.route("/journal")
@login_required
def dashboard():
    logged_in_user = session['current_user']
    #Get user's first name
    the_user_name = User.query.filter_by(id=logged_in_user).first()
    #pass in journal entries
    journal_entries = Entry.query.filter_by(user_id=logged_in_user).order_by(Entry.created_at.desc()).all()
    return render_template('journal.html', journal_entries = journal_entries, the_user_name=the_user_name)

@app.route("/journal-saved", methods=["POST"])
@login_required
def save_journal():
    #get data from journal form
    body = request.form.get('journal_entry')
    created_at = request.form.get('created_at')
    spotify_song_id = request.form.get('spotify_song')
    user_id = session['current_user']
    energy_ranking = request.form.get('energy')
    mood_ranking = request.form.get('happiness')

    #create database entry with object Entry
    entry = Entry(body=body, 
                created_at=created_at, 
                spotify_song_id=spotify_song_id, 
                user_id=user_id, 
                energy_ranking=energy_ranking, 
                mood_ranking = mood_ranking)
    db.session.add(entry)
    db.session.commit()
    flash("Created Entry Successfully!")
    print("Created Entry Successfully!")
    return redirect("/journal")


#TEST DATA 

@app.route("/test-data")
def test_data():

    #Generate the song recommendation using Spotify's recommendation request, using given parameters
    #Basic function, may add more specifc user seeds in V2 
    #This works, now branch off and do more testing with inputs

    def show_recommendations():
        results = spotify.recommendations(seed_artists=['4NHQUGzhtTLFvgF5SZesLK'],max_danceability=.5)
        song_bin = []
        for track in results['tracks']:
            song_bin.append(track['external_urls']['spotify'])
        return song_bin
    result_a = choice(show_recommendations())
    result = result_a.strip("https://open.spotify.com/track/")
    print(result)
    return render_template('test-spotify.html', result = result)


#Flask Login Manager
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)


if __name__ == '__main__':
    app.debug = True
    connect_to_db(app)
    login_manager.init_app(app)
    app.run(host='0.0.0.0')