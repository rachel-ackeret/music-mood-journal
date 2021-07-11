from flask import Flask, render_template, request, flash, redirect, session, jsonify
from pprint import pformat
import os
import requests
import spotipy
from random import choice
from spotipy.oauth2 import SpotifyClientCredentials
from flask_login import LoginManager, login_user, login_required, current_user, logout_user
from sqlalchemy import desc
from model import connect_to_db, User, Entry, db, WeatherDetails, SongDetails
import crud
import bcrypt

# Weather API
WEATHER_KEY = os.environ['WEATHER_API_KEY']

# Flask setup
app = Flask(__name__)
app.secret_key = "SECRETSECRETSECRET"

# Flask login setup
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)


def unauthorized_handler(self, callback):
    """This will set the callback for the `unauthorized` method, which among
        other things is used by `login_required`. It takes no arguments, and
        should return a response to be sent to the user instead of their
        normal view.

        :param callback: The callback for unauthorized users.
        :type callback: callable"""

    self.unauthorized_callback = callback
    return callback


@login_manager.unauthorized_handler
def unauthorized():
    return redirect("/")
#Spotipy credentials
SPOTIPY_REDIRECT_URI="http://localhost:5000/"
auth_manager = SpotifyClientCredentials()
spotify_credentials = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials())

#base URL
url = "https://api.spotify.com/v1/"

# HOMEPAGE for LOGIN & REGISTRATION
@app.route("/")
def homepage():
    """Show homepage."""

    if current_user.is_authenticated:
        return redirect("/journal")

    return render_template("homepage.html")


#LOGIN ROUTE
@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    password = request.form.get("password").encode('utf-8')
    
    pw_hash = bcrypt.hashpw(password, bcrypt.gensalt(14))

    user = User.query.filter_by(username=username).first()
    if bcrypt.checkpw(user.password, pw_hash):
        # Call flask_login.login_user to login a user
        login_user(user)

        if not user.genre_choice:
            return redirect("/genre")

        return redirect("/journal")
    
    #If password is empty or reset for security purposes -
    if user.password == '_':
        return redirect("/password-reset")

    print("sorry try again")
    flash("Sorry try again.")
    return redirect("/")


@app.route("/register", methods=["POST"])
def register():
    username = request.form.get("username")
    password = request.form.get("password").encode("utf-8")
    fname = request.form.get("fname")
    zipcode = request.form.get("zipcode")

    pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    if not User.query.filter_by(username=username).first():
        user = User(
            username=username,
            password=pw_hash,
            fname = fname,
            zipcode = zipcode,
        )

        db.session.add(user)
        db.session.commit()

        return redirect("/")

    flash("User already Created.")

    return redirect("/")


@app.route("/password-reset-page")
def resetpw():
    return render_template("password-reset.html")


@app.route("/password-reset-save", methods=["POST"])
def savepw():

    username = request.form.get("username")
    password = request.form.get("password").encode("utf-8")

    pw_hash = bcrypt.hashpw(password, bcrypt.gensalt(14))
    
    user = User.query.filter_by(username=username).first()

    if user.password == '_':
        user.password=pw_hash

    return render_template("/")


@app.route("/genre")
@login_required
def genre_picker():

    available_genres = spotify_credentials.recommendation_genre_seeds()
    genres = available_genres["genres"]
    print(genres)

    return render_template("genre-picker.html" , genres=genres)


@app.route("/save-genre", methods=["POST"])
@login_required
def save_genre():

    genre_choice = request.form.getlist("genre-choice[]")
    print(genre_choice)
    # user = User(
    #     genre_choice=genre_choice
    # )

    current_user.genre_choice = genre_choice
    db.session.commit()
    
    flash("Genres Updated")

    return redirect("/")

@app.route("/journal")
@login_required
def create_journal_entry():
    return render_template("journal.html")


@app.route("/journal-saved", methods=["POST"])
@login_required
def save_journal():
    #get data from journal form
    body = request.form.get("journal_entry")
    energy_ranking = int(request.form.get("energy"))
    mood_ranking = int(request.form.get("happiness"))
    zipcode = current_user.zipcode
    genres = current_user.genre_choice

    spotify_song_id, song_image, song_preview, song_artist, song_name, danceability, energy, tempo = crud.get_recipe(genres, energy_ranking, mood_ranking, spotify_credentials)
    temperature, clouds, weather_id, weather_description, weather_icon, second_weather_icon = crud.return_weather_data(zipcode, WEATHER_KEY)

    print(song_artist)
    print(song_name)
    #create database entry with object Entry

    weather = WeatherDetails(temperature=temperature,
                            clouds=clouds,
                            weather_id=weather_id,
                            weather_description=weather_description,
                            weather_icon=weather_icon,
                            second_weather_icon=second_weather_icon,
                            zip_code=zipcode)                  

    song = SongDetails(song_image=song_image,
                        song_preview=song_preview,
                        song_artist=song_artist,
                        song_name=song_name,
                        danceability=danceability,
                        energy=energy,
                        tempo=tempo)
    
    entry = Entry(body=body, 
                spotify_song_id=spotify_song_id,
                energy_ranking=energy_ranking, 
                mood_ranking = mood_ranking,
                weather_details = weather,
                song_details = song)
    
    current_user.entries.append(entry)
    db.session.add(weather)
    db.session.add(song)
    db.session.add(entry)
    db.session.commit()

    flash("Created Entry Successfully!")
    print("Created Entry Successfully!")

    return redirect("/dashboard")

@app.route("/logout")
def logout():
    logout_user()
    return redirect("/")
    

@app.route("/dashboard")
@login_required
def dashboard():
    return render_template("dashboard.html")


@app.route("/api/entry-edit/<entry_id>", methods=["POST"])
def edit_entry(entry_id):
    """Edit journal entry.
    
    Arguments:
        - journal_entry: optional, if present this is used to update body of entry
        - energy: optional, if present this is used to update energy
          of entry
        - happiness: optional, if present this is used to update mood
          of entry 
    """
    
    body = request.form.get("journal_entry_edit")
    print(body)
    energy_ranking = request.form.get("energy_edit")
    print(energy_ranking)
    mood_ranking = request.form.get("mood_edit")
    print(entry_id)
    journal_entry = Entry.query.get(entry_id)
    song_details = SongDetails.query.filter(SongDetails.entry_id==entry_id).first()
    
    mood_ranking_updated = ''
    energy_ranking_updated = ''

    if body:
        journal_entry.body = body

    if energy_ranking:
        journal_entry.energy_ranking = int(energy_ranking)
        energy_ranking_updated = True
    else:
        energy_ranking = journal_entry.energy_ranking

    if mood_ranking:
        journal_entry.mood_ranking = int(mood_ranking)
        mood_ranking_updated = True
    else: 
        mood_ranking = journal_entry.mood_ranking 
    
    #Refresh journal entry song if either mood or energy is updated
    if mood_ranking_updated or energy_ranking_updated:
        user_genres = current_user.genre_choice
        journal_entry.spotify_song_id, song_details.song_image, song_details.song_preview, song_details.song_artist, song_details.song_name, song_details.danceability, song_details.energy, song_details.tempo = crud.get_recipe(user_genres, journal_entry.energy_ranking, journal_entry.mood_ranking, spotify_credentials)
    
    db.session.add(song_details)
    db.session.add(journal_entry)
    db.session.commit()
    
    entry_dict = {
        "id": journal_entry.id,
        "body": journal_entry.body,
        "created_at": journal_entry.created_at,
        "spotify_song_id": journal_entry.spotify_song_id,
        "user_id": journal_entry.user_id,
        "energy_ranking": journal_entry.energy_ranking,
        "mood_ranking": journal_entry.mood_ranking,
        "song_image": song_details.song_image,
        "song_preview": song_details.song_preview,
        "song_artist": song_details.song_artist,
        "song_name": song_details.song_name,
        "danceability": song_details.danceability,
        "energy": song_details.energy,
        "tempo": song_details.tempo
    }
    return entry_dict


@app.route("/api/entries/")
@login_required
def get_latest_entries():
    #custom_limit = int(request.args.get("limit", 10))
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    get_latest = request.args.get("get_latest")

    entries_query = Entry.query
    if start_date and end_date:
        entries_query = entries_query.filter(Entry.created_at.between(start_date, end_date))

    current_user_id = current_user.id

    if get_latest:
        print('get the latest!')
        journal_entries = entries_query.filter(Entry.user_id==current_user_id).order_by(desc(Entry.created_at)).first()
    else:
        journal_entries = entries_query.filter(Entry.user_id==current_user_id).order_by(desc(Entry.created_at)).all()

    entries_as_json = []

    for journal_entry in journal_entries:
        print(journal_entry.weather_details)
        entries_as_json.append({
            "id": journal_entry.id,
            "body": journal_entry.body,
            "created_at": journal_entry.created_at,
            "spotify_song_id": journal_entry.spotify_song_id,
            "user_id": journal_entry.user_id,
            "energy_ranking": journal_entry.energy_ranking,
            "mood_ranking": journal_entry.mood_ranking,
            "weather_description": journal_entry.weather_details and journal_entry.weather_details.weather_description,
            "temperature": journal_entry.weather_details and journal_entry.weather_details.temperature,
            "weather_icon": journal_entry.weather_details and journal_entry.weather_details.weather_icon,
            "second_weather_icon": journal_entry.weather_details and journal_entry.weather_details.second_weather_icon,
            "song_image": journal_entry.song_details and journal_entry.song_details.song_image,
            "song_preview": journal_entry.song_details and journal_entry.song_details.song_preview,
            "song_artist": journal_entry.song_details and journal_entry.song_details.song_artist,
            "song_name": journal_entry.song_details and journal_entry.song_details.song_name,
            "danceability": journal_entry.song_details and journal_entry.song_details.danceability,
            "energy": journal_entry.song_details and journal_entry.song_details.energy,
            "tempo": journal_entry.song_details and journal_entry.song_details.tempo
        })

    return jsonify(entries_as_json)


@app.route("/api/entries/last/")
@login_required
def get_last_entry():

    entries_query = Entry.query
    current_user_id = current_user.id
    
    print('get the latest!')
    journal_entry = entries_query.filter(Entry.user_id==current_user_id).order_by(desc(Entry.created_at)).first()
   
    entry_json = {
        "id": journal_entry.id,
        "body": journal_entry.body,
        "created_at": journal_entry.created_at,
        "spotify_song_id": journal_entry.spotify_song_id,
        "user_id": journal_entry.user_id,
        "energy_ranking": journal_entry.energy_ranking,
        "mood_ranking": journal_entry.mood_ranking,
        "weather_description": journal_entry.weather_details and journal_entry.weather_details.weather_description,
        "temperature": journal_entry.weather_details and journal_entry.weather_details.temperature,
        "weather_icon": journal_entry.weather_details and journal_entry.weather_details.weather_icon,
        "second_weather_icon": journal_entry.weather_details and journal_entry.weather_details.second_weather_icon,
        "song_image": journal_entry.song_details and journal_entry.song_details.song_image,
        "song_preview": journal_entry.song_details and journal_entry.song_details.song_preview,
        "song_artist": journal_entry.song_details and journal_entry.song_details.song_artist,
        "song_name": journal_entry.song_details and journal_entry.song_details.song_name,
        "danceability": journal_entry.song_details and journal_entry.song_details.danceability,
        "energy": journal_entry.song_details and journal_entry.song_details.energy,
        "tempo": journal_entry.song_details and journal_entry.song_details.tempo
    }

    return jsonify(entry_json)


#TEST DATA 


if __name__ == "__main__":
    connect_to_db(app)
    app.run()
    # app.run(host="0.0.0.0")
    # app.run(use_reloader=True, use_debugger=True)