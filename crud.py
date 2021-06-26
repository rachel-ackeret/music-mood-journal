import server
from random import choice
import requests

def match_icon(weather_code):
#match outsourced icon pack with the codes provided.
    cloudy = [803]
    clear = [800]
    partial_cloud = [801, 802]
    rain_thunder = [200, 201, 202, 230, 231, 232]
    rain = [300, 301, 302, 310, 311, 312, 313, 314, 500, 501, 502, 503, 504, 520, 521, 522, 531]
    # sleet = []
    thunder = [210, 211, 212, 221]
    # snow_thunder = []
    snow = [511, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622 ]
    fog_mist = [701, 711, 721, 741, 751, 761, 762, 771]
    tornado = [731, 781]
    # wind = []
    overcast = [804]

    if weather_code in cloudy:
        return "/static/icons/cloudy.png"
    elif weather_code in clear:
        return "/static/icons/day_clear.png"
    elif weather_code in partial_cloud:
        return "/static/icons/day_partial_cloud.png"
    elif weather_code in rain_thunder:
        return "/static/icons/day_rain_thunder.png"
    elif weather_code in rain:
        return "/static/icons/day_rain.png"
    elif weather_code in thunder:
        return "/static/icons/thunder.png"
    elif weather_code in snow:
        return "/static/icons/day_snow.png"
    elif weather_code in fog_mist:
        return "/static/icons/fog.png"
    elif weather_code in tornado:
        return "/static/icons/tornado.png"
    elif weather_code in overcast:
        return "/static/icons/overcast.png"
    else:
        return None


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
    second_weather_icon = match_icon(weather_id)
    return [temperature, clouds, weather_id, weather_description, weather_icon, second_weather_icon]

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
