from flask import Flask, render_template, request, flash, redirect, session, jsonify
from pprint import pformat
import os
import requests
import spotipy
from random import choice
from spotipy.oauth2 import SpotifyClientCredentials
from flask_login import LoginManager, login_user, login_required, current_user, logout_user

from model import connect_to_db, User, Entry, db, WeatherDetails, SongDetails
import crud

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
    password = request.form.get("password")
    
    # For debugging
    print(username)
    print(password)

    user = User.query.filter_by(username=username).first()
    if user and user.password == password:
        # Call flask_login.login_user to login a user
        login_user(user)

        flash("Logged in successfully!")
        return redirect("/journal")

    print("sorry try again")
    flash("Sorry try again.")
    return redirect("/")


@app.route("/register", methods=["POST"])
def register():
    username = request.form.get("username")
    password = request.form.get("password")
    fname = request.form.get("fname")
    lname = request.form.get("lname")

    if not User.query.filter_by(username=username).first():
        user = User(
            username=username,
            password=password,
            fname = fname,
            lname = lname,
        )

        db.session.add(user)
        db.session.commit()

        flash("Created User Successfully!")

        return redirect("/")

    flash("User already Created.")

    return redirect("/")

#redirect them to the login for users not logged in

@app.route("/journal")
@login_required
def dashboard():
    return render_template("journal.html")


@app.route("/journal-saved", methods=["POST"])
@login_required
def save_journal():
    #get data from journal form
    body = request.form.get("journal_entry")
    energy_ranking = int(request.form.get("energy"))
    mood_ranking = int(request.form.get("happiness"))
    zipcode = request.form.get("zipcode")

    spotify_song_id = crud.get_recipe(energy_ranking, mood_ranking)
    temperature, clouds, weather_id, weather_description, weather_icon = crud.return_weather_data(zipcode)

    print(spotify_song_id)
    #create database entry with object Entry
    entry = Entry(body=body, 
                # user_id=user_id,
                spotify_song_id=spotify_song_id,
                energy_ranking=energy_ranking, 
                mood_ranking = mood_ranking)
    current_user.entries.append(entry)

    weather = WeatherDetails(temperature=temperature,
                                clouds=clouds,
                                weather_id=weather_id,
                                weather_description=weather_description,
                                weather_icon=weather_icon,
                                zip_code=zipcode)
    entry.weather_details.append(weather)

    # song = SongDetails(song_image=song_image,
    #                     song_preview=song_preview)
    # entry.song_details.append(song)
    
    
    db.session.add(weather)
    # db.session.add(song_details)
    db.session.add(entry)
    db.session.commit()

    flash("Created Entry Successfully!")
    print("Created Entry Successfully!")

    return redirect("/journal")

@app.route("/logout")
def logout():
    logout_user()
    return redirect("/")
    

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
    energy_ranking = request.form.get("energy")
    mood_ranking = request.form.get("happiness")

    journal_entry = Entry.query.get(entry_id)
    
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
        journal_entry.spotify_song_id = crud.get_recipe(journal_entry.energy_ranking, journal_entry.mood_ranking)
    
    db.session.add(journal_entry)
    db.session.commit()

    return {
        "id": journal_entry.id,
        "body": journal_entry.body,
        "created_at": journal_entry.created_at,
        "spotify_song_id": journal_entry.spotify_song_id,
        "user_id": journal_entry.user_id,
        "energy_ranking": journal_entry.energy_ranking,
        "mood_ranking": journal_entry.mood_ranking
    }


@app.route("/api/entry/<entry_id>", methods=["POST"])
def fetch_entry(entry_id):
    journal_entry = Entry.query.get(entry_id)
    return {
        "id": journal_entry.id,
        "body": journal_entry.body,
        "created_at": journal_entry.created_at,
        "spotify_song_id": journal_entry.spotify_song_id,
        "user_id": journal_entry.user_id,
        "energy_ranking": journal_entry.energy_ranking,
        "mood_ranking": journal_entry.mood_ranking
    }


@app.route("/api/entries/")
def get_latest_entries():
    #custom_limit = int(request.args.get("limit", 10))
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    
    entries_query = Entry.query
    if start_date and end_date:
        entries_query = entries_query.filter(Entry.created_at.between(start_date, end_date))

    journal_entries = entries_query.all()

    entries_as_json = []
    for journal_entry in journal_entries:
        entries_as_json.append({
            "id": journal_entry.id,
            "body": journal_entry.body,
            "created_at": journal_entry.created_at,
            "spotify_song_id": journal_entry.spotify_song_id,
            "user_id": journal_entry.user_id,
            "energy_ranking": journal_entry.energy_ranking,
            "mood_ranking": journal_entry.mood_ranking
        })
        
    return jsonify(entries_as_json)


#TEST DATA 

@app.route("/test-chart")
@login_required
def testchart():
    return render_template("test-chart.html")



if __name__ == "__main__":
    app.debug = True
    connect_to_db(app)
    app.run(host="0.0.0.0")
    # app.run(use_reloader=True, use_debugger=True)