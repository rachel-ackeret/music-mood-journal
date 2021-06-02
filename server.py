from flask import Flask, render_template, request, flash, redirect

from pprint import pformat
import os
import requests
import spotipy
#from spotipy.oauth2 import SpotifyClientCredentials
from flask_login import LoginManager, login_user, login_required
from flask_sqlalchemy import SQLAlchemy
from model import connect_to_db, User

db = SQLAlchemy()

login_manager = LoginManager()
#Flask credentials
app = Flask(__name__)
app.secret_key = 'SECRETSECRETSECRET'

#Spotipy credentials
# SPOTIPY_REDIRECT_URI='http://localhost:5000/'
# auth_manager = SpotifyClientCredentials()
# sp = spotipy.Spotify(auth_manager=auth_manager)


#base URL
url = 'https://api.spotify.com/v1/'

# TEST HOMEPAGE for AUTH
@app.route('/')
def homepage():
    """Show homepage."""
    return render_template('homepage.html')

@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    password = request.form.get("password")

    user = User.query.filter_by(username=username).first()

    if user.password == password:
	    # Call flask_login.login_user to login a user
        login_user(user)

        flash("Logged in successfully!")

        return redirect("/journal")

    flash("Sorry try again.")
    return redirect("/")

@app.route("/register", methods=["POST"])
def register():
    username = request.form.get("username")
    password = request.form.get("password")
    fname = request.form.get("fname")
    lname = request.form.get("lname")

    if User.query.filter_by(username=username) == None:
        db.session.execute(sql, {'username' : username, 
                                'password': password, 
                                'fname': fname, 
                                'lname': lname})
    
        db.session.commit()
        flash("Created User Successfully!")
        return redirect("/journal")

    flash("User already Created.")
    return redirect("/")

@app.route("/journal")
@login_required
def dashboard():
    return render_template("journal.html")

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)


if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0')
    connect_to_db(app)
    login_manager.init_app(app)