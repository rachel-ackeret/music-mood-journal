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

    #Test some fields user eventually will input
    #using the largest playlist on spotify as a seed: https://open.spotify.com/playlist/5S8SJdl1BDc0ugpkEvFsIL?si=6741d4a2a6bd4756

    energy_input = 8
    mood_input = 3
    
    def high_energy_high_mood(e, m):
        #based on energy ranking
        target_danceabiliity = (e * .1)
        target_energy = (e * .1)
        #based on mood ranking
        mode = 1
        #this is based on an assumption of the happiest song having 165 BPM (could change assumption)
        target_tempo = m * 16.5
        results = spotify.recommendations(seed_genres=['pop'], 
                                        target_danceabiliity=target_danceabiliity, 
                                        target_energy=target_energy, 
                                        mode=mode, 
                                        target_tempo=target_tempo)

        song_bin = []                                        
        for track in results['tracks']:
            song_bin.append(track['external_urls']['spotify'])

        result_c = choice(song_bin)
        resulting_song_id = result_c.strip("https://open.spotify.com/track/")

        return resulting_song_id

    def low_energy_high_mood(e, m):
        #based on ENERGY ranking
        target_energy = e * .1
        target_loudness = e * .1
        #based on MOOD ranking
        mode = 1
        #this is based on an assumption of the happiest song having 165 BPM (could change assumption)
        target_tempo = m * 16.5
        results = spotify.recommendations(seed_genres=['pop'], 
                                        target_energy=target_energy, 
                                        target_loudness=target_loudness, 
                                        mode=mode, 
                                        target_tempo=target_tempo)

        song_bin = []                                        
        for track in results['tracks']:
            song_bin.append(track['external_urls']['spotify'])

        result_c = choice(song_bin)
        resulting_song_id = result_c.strip("https://open.spotify.com/track/")

        return resulting_song_id

    def low_energy_low_mood(e, m):
        #based on ENERGY ranking
        target_energy = e * .1
        target_loudness = e * .1
        #based on MOOD ranking
        target_acousticness = (m * .1) + .5 
        #this is based on an assumption of the happiest song having 165 BPM (could change assumption)
        target_tempo = m * 16.5
        results = spotify.recommendations(seed_genres=['pop'], 
                                        target_energy=target_energy, 
                                        target_loudness=target_loudness, 
                                        target_acousticness=target_acousticness, 
                                        target_tempo=target_tempo)

        song_bin = []                                        
        for track in results['tracks']:
            song_bin.append(track['external_urls']['spotify'])

        result_c = choice(song_bin)
        resulting_song_id = result_c.strip("https://open.spotify.com/track/")

        return resulting_song_id

    def high_energy_low_mood(e, m):
        #based on ENERGY ranking
        target_danceabiliity = (e * .1)
        target_energy = (e * .1)
        #based on MOOD ranking
        target_acousticness = (m * .1) + .5 
        #this is based on an assumption of the happiest song having 165 BPM (could change assumption)
        target_tempo = m * 16.5
        results = spotify.recommendations(seed_genres=['pop'], 
                                        target_energy=target_energy, 
                                        target_danceabiliity=target_danceabiliity, 
                                        target_acousticness=target_acousticness, 
                                        target_tempo=target_tempo)

        song_bin = []                                        
        for track in results['tracks']:
            song_bin.append(track['external_urls']['spotify'])

        result_c = choice(song_bin)
        resulting_song_id = result_c.strip("https://open.spotify.com/track/")

        return resulting_song_id

    #choose which function to run based on inputs
    def get_recipe(energy, mood):
        if (energy > 5) and (mood > 5):
            return high_energy_high_mood(energy, mood)
        elif (energy < 5) and (mood > 5):
            return low_energy_high_mood(energy,mood)
        elif (energy < 5) and (mood < 5):
            return low_energy_low_mood(energy,mood)
        elif (energy > 5) and (mood < 5):
            return high_energy_low_mood(energy,mood)
        else:
            print('Oops, nothing happened')


    the_final_result = get_recipe(energy_input, mood_input)


    return render_template('test-spotify.html', the_final_result=the_final_result)


#Flask Login Manager
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)


if __name__ == '__main__':
    app.debug = True
    connect_to_db(app)
    login_manager.init_app(app)
    app.run(host='0.0.0.0')