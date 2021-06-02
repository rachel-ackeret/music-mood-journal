from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class User(db.Model, UserMixin):
    """User Directory"""

    __tablename__ = "users"

    user_id = db.Column(db.Integer,
                       primary_key=True,
                       autoincrement=True,
                       )
    username = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(15), nullable=False)
    fname = db.Column(db.String(15), nullable=True)
    lname = db.Column(db.String(15), nullable=True)

    def __repr__(self):
        return f'<User user_id={self.user_id} username={self.username} first_name={self.first_name} last_name={self.last_name}>'

db = SQLAlchemy()
def connect_to_db(flask_app, db_uri='postgresql:///users', echo=True):
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    flask_app.config['SQLALCHEMY_ECHO'] = echo
    flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.app = flask_app
    db.init_app(flask_app)

    print('Connected to the db!')

if __name__ == '__main__':
    from server import app
    connect_to_db(app)