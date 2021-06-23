from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from flask import Flask
db = SQLAlchemy()

class User(db.Model, UserMixin):
    """User Directory"""

    __tablename__ = "users"

    id = db.Column(db.Integer,
                       primary_key=True,
                       autoincrement=True,
                       )
    username = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(15), nullable=False)
    fname = db.Column(db.String(15), nullable=True)
    lname = db.Column(db.String(15), nullable=True)
    
    entries = db.relationship(
        "Entry",
        backref="user",
        order_by="desc(Entry.created_at)", 
    )

    def __repr__(self):
        return f"<User user_id={self.user_id} username={self.username} first_name={self.first_name} last_name={self.last_name}>"
    

    def get_id(self):
        """Override UserMixin.get_id."""
        
        return str(self.id)
    

class Entry(db.Model):
    """Journal Entries"""

    __tablename__ = "entries"

    id = db.Column(db.Integer,
                       primary_key=True,
                       autoincrement=True,
                       )
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    updated_at = db.Column(db.DateTime, nullable=True)
    spotify_song_id = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey(User.id))
    energy_ranking = db.Column(db.Float, nullable=False)
    mood_ranking = db.Column(db.Float, nullable=False)
    
    def __repr__(self):
        return f"<Entry id={self.id} created_at={self.created_at} spotify_song_id={self.spotify_song_id} user_id={self.user_id}>"


class WeatherDetails(db.Model):
    """Weather."""

    __tablename__ = "weather_details"

    id = db.Column(db.Integer,
                   primary_key=True,
                       autoincrement=True,
    )
    temperature = db.Column(db.Float, nullable=False)
    clouds = db.Column(db.Float, nullable=False)
    weather_description = db.Column(db.String, nullable=False)
    weather_id = db.Column(db.Integer, nullable=False)
    weather_icon = db.Column(db.String, nullable=False)
    zip_code = db.Column(db.String, nullable=False)
    entry_id = db.Column(db.Integer, db.ForeignKey(Entry.id))
   
    entry = db.relationship('Entry', backref='weather_details')


class SongDetails(db.Model):
    """SongDetails."""

    __tablename__ = "song_details"

    id = db.Column(db.Integer,
                   primary_key=True,
                       autoincrement=True,
    )
    song_image = db.Column(db.String, nullable=True)
    song_preview = db.Column(db.String, nullable=True)
    entry_id = db.Column(db.Integer, db.ForeignKey(Entry.id))
   
    entry = db.relationship('Entry', backref='song_details')


#Connect to the database
def connect_to_db(flask_app, db_uri="postgresql:///database", echo=True):
    flask_app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
    flask_app.config["SQLALCHEMY_ECHO"] = echo
    flask_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.app = flask_app
    db.init_app(flask_app)
    db.create_all()
    print("Connected to the db!")

if __name__ == "__main__":
    from server import app
    #connect_to_db(app) 
    #may or may not need this. 