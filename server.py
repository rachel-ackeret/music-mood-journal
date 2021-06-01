from flask import Flask, render_template, request

from pprint import pformat
import os
import requests
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

#Flask credentials
app = Flask(__name__)
app.secret_key = 'SECRETSECRETSECRET'

#API_KEY = os.environ['']

SPOTIPY_REDIRECT_URI='http://localhost:5000/'

#base URL
url = 'https://api.spotify.com/v1/'

#API Key for Spotify
# payload = {'apikey': '8582183d20d94a61b868892d3d0d5ac4'}
# res = requests.get(url, params=payload)

auth_manager = SpotifyClientCredentials()
sp = spotipy.Spotify(auth_manager=auth_manager)

birdy_uri = 'spotify:artist:2WX2uTcsvV5OnS0inACecP'
spotify = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials())

results = spotify.artist_albums(birdy_uri, album_type='album')
albums = results['items']
while results['next']:
    results = spotify.next(results)
    albums.extend(results['items'])

for album in albums:
    print(album['name'])

# TEST HOMEPAGE for AUTH
@app.route('/')
def homepage():
    """Show homepage."""

        
    return render_template('homepage.html')



if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0')