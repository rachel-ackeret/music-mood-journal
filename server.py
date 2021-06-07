from flask import Flask, render_template, request, flash, redirect, session

from pprint import pformat
import os
import requests
import spotipy
from random import choice
from spotipy.oauth2 import SpotifyClientCredentials
from flask_login import LoginManager, login_user, login_required, current_user

from model import connect_to_db, User, Entry, db
import crud

# Flask setup
app = Flask(__name__)
app.secret_key = "SECRETSECRETSECRET"

# Flask login setup
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

#Spotipy credentials
SPOTIPY_REDIRECT_URI="http://localhost:5000/"
auth_manager = SpotifyClientCredentials()
spotify = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials())

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


@app.route("/journal")
@login_required
def dashboard():
    return render_template("journal.html")


@app.route("/journal-saved", methods=["POST"])
@login_required
def save_journal():
    #get data from journal form
    body = request.form.get("journal_entry")
    # user_id = session["current_user"]
    energy_ranking = int(request.form.get("energy"))
    mood_ranking = int(request.form.get("happiness"))
    spotify_song_id = crud.get_recipe(energy_ranking, mood_ranking)

    #create database entry with object Entry
    entry = Entry(body=body, 
                # user_id=user_id,
                spotify_song_id=spotify_song_id, 
                energy_ranking=energy_ranking, 
                mood_ranking = mood_ranking)
    current_user.entries.append(entry)

    db.session.add(entry)
    db.session.commit()

    flash("Created Entry Successfully!")
    print("Created Entry Successfully!")

    return redirect("/journal")


#TEST DATA 

@app.route("/test-data")
def test_data():
    return render_template("test-spotify.html")


if __name__ == "__main__":
    app.debug = True
    connect_to_db(app)

    app.run(host="0.0.0.0")
    # app.run(use_reloader=True, use_debugger=True)