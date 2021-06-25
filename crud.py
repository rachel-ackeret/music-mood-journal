import server
from random import choice
import requests


def return_weather_data(zipcode, weather_key):
    #api.openweathermap.org/data/2.5/weather?zip={zip code}&appid={API key}

    query = 'https://api.openweathermap.org/data/2.5/weather'
    zipcode_string = '?zip=' + zipcode
    apikey_string = ',us&appid=' + weather_key
    resulting_weather = query + zipcode_string + apikey_string + '&units=imperial'
    
 

    res = (requests.get(resulting_weather)).json()
    print(res)   

    temperature = res['main']['temp']
    clouds = res['clouds']['all']
    weather_id = res['weather'][0]['id']
    weather_description = res['weather'][0]['description']
    weather_icon = res['weather'][0]['icon']
    return [temperature, clouds, weather_id, weather_description, weather_icon]

def high_energy_high_mood(e, m, spotify_credentials):
    """Runs qualified entries and pushes the target metrics to Spotifys 
    recommendation API request. Returns single song track ID."""
    #based on energy ranking
    target_danceabiliity = (e * .1)
    target_energy = (e * .1)
    #based on mood ranking
    mode = 1
    #this is based on an assumption of the happiest song having 165 BPM (could change assumption)
    target_tempo = m * 16.5
    resulting_songs = spotify_credentials.recommendations(seed_genres=['pop'], 
                                    target_danceabiliity=target_danceabiliity, 
                                    target_energy=target_energy, 
                                    mode=mode, 
                                    target_tempo=target_tempo,
                                    limit=20)

    return resulting_songs
    

def low_energy_high_mood(e, m, spotify_credentials):
    """Runs qualified entries and pushes the target metrics to Spotifys 
    recommendation API request. Returns single song track ID."""
    #based on ENERGY ranking
    target_energy = e * .1
    target_loudness = e * .1
    #based on MOOD ranking
    mode = 1
    #this is based on an assumption of the happiest song having 165 BPM (could change assumption)
    target_tempo = m * 16.5
    resulting_songs = spotify_credentials.recommendations(seed_genres=['pop'], 
                                    target_energy=target_energy, 
                                    target_loudness=target_loudness, 
                                    mode=mode, 
                                    target_tempo=target_tempo,
                                    limit=20)

    return resulting_songs

def low_energy_low_mood(e, m, spotify_credentials):
    """Runs qualified entries and pushes the target metrics to Spotifys 
    recommendation API request. Returns single song track ID."""
    #based on ENERGY ranking
    target_energy = e * .1
    target_loudness = e * .1
    #based on MOOD ranking
    target_acousticness = (m * .1) + .5 
    #this is based on an assumption of the happiest song having 165 BPM (could change assumption)
    target_tempo = m * 16.5
    resulting_songs = spotify_credentials.recommendations(seed_genres=['pop'], 
                                    target_energy=target_energy, 
                                    target_loudness=target_loudness, 
                                    target_acousticness=target_acousticness, 
                                    target_tempo=target_tempo,
                                    limit=20)

    return resulting_songs
    
def high_energy_low_mood(e, m, spotify_credentials):
    """Runs qualified entries and pushes the target metrics to Spotifys 
    recommendation API request. Returns single song track ID."""
    #based on ENERGY ranking
    target_danceabiliity = (e * .1)
    target_energy = (e * .1)
    #based on MOOD ranking
    target_acousticness = (m * .1) + .5 
    #this is based on an assumption of the happiest song having 165 BPM (could change assumption)
    target_tempo = m * 16.5
    resulting_songs = spotify_credentials.recommendations(seed_genres=['pop'], 
                                    target_energy=target_energy, 
                                    target_danceabiliity=target_danceabiliity, 
                                    target_acousticness=target_acousticness, 
                                    target_tempo=target_tempo,
                                    limit=20)

    return resulting_songs

#choose which function to run based on inputs
def get_recipe(energy, mood, spotify_credentials):
    """direct user inputs to the correct music producing function based on their rankings"""
    if (energy >= 5) and (mood >= 5):
        resulting_songs = high_energy_high_mood(energy, mood, spotify_credentials)
    elif (energy < 5) and (mood >= 5):
        resulting_songs = low_energy_high_mood(energy, mood, spotify_credentials)
    elif (energy < 5) and (mood < 5):
        resulting_songs = low_energy_low_mood(energy, mood, spotify_credentials)
    elif (energy >= 5) and (mood < 5):
        resulting_songs = high_energy_low_mood(energy, mood, spotify_credentials)
    else:
        print('Oops, nothing happened')

    return get_song_info(resulting_songs, spotify_credentials)

def get_song_info(the_resulting_songs, spotify_credentials):       

    song_bin = [] 
    song_info = []

    for track in the_resulting_songs['tracks']:
        song_bin.append(track['id'])
    
    is_preview_empty = True

    while is_preview_empty:
        song_key = choice(song_bin)
        preview_test = spotify_credentials.track(track_id=song_key)["preview_url"]
        if preview_test is not None:
            is_preview_empty = False
            print(is_preview_empty)

    song_info.append(song_key)
    song_info.append(spotify_credentials.track(track_id=song_key)["album"]["images"][0]["url"])
    song_info.append(spotify_credentials.track(track_id=song_key)["preview_url"])

    print(song_info)

    return song_info
