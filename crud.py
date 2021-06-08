import server
from random import choice
from server import spotify

def high_energy_high_mood(e, m):
    """Runs qualified entries and pushes the target metrics to Spotifys 
    recommendation API request. Returns single song track ID."""
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
    #creating empty list for the 20(?) songs Spotify will return as recommendations. 
    #Could eventually limit the result to 1, but for now choosing random.
    song_bin = []                                        
    for track in results['tracks']:
        song_bin.append(track['external_urls']['spotify'])

    result_c = choice(song_bin)
    resulting_song_id = result_c.strip("https://open.spotify.com/track/")

    return resulting_song_id

def low_energy_high_mood(e, m):
    """Runs qualified entries and pushes the target metrics to Spotifys 
    recommendation API request. Returns single song track ID."""
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
    #creating empty list for the 20(?) songs Spotify will return as recommendations. 
    #Could eventually limit the result to 1, but for now choosing random.
    song_bin = []                                        
    for track in results['tracks']:
        song_bin.append(track['external_urls']['spotify'])

    result_c = choice(song_bin)
    resulting_song_id = result_c.strip("https://open.spotify.com/track/")

    return resulting_song_id

def low_energy_low_mood(e, m):
    """Runs qualified entries and pushes the target metrics to Spotifys 
    recommendation API request. Returns single song track ID."""
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
    #creating empty list for the 20(?) songs Spotify will return as recommendations. 
    #Could eventually limit the result to 1, but for now choosing random.
    song_bin = []                                        
    for track in results['tracks']:
        song_bin.append(track['external_urls']['spotify'])

    result_c = choice(song_bin)
    resulting_song_id = result_c.strip("https://open.spotify.com/track/")

    return resulting_song_id

def high_energy_low_mood(e, m):
    """Runs qualified entries and pushes the target metrics to Spotifys 
    recommendation API request. Returns single song track ID."""
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
    #creating empty list for the 20(?) songs Spotify will return as recommendations. 
    #Could eventually limit the result to 1, but for now choosing random.
    song_bin = []                                        
    for track in results['tracks']:
        song_bin.append(track['external_urls']['spotify'])

    result_c = choice(song_bin)
    resulting_song_id = result_c.strip("https://open.spotify.com/track/")

    return resulting_song_id

#choose which function to run based on inputs
def get_recipe(energy, mood):
    if (energy >= 5) and (mood >= 5):
        return high_energy_high_mood(energy, mood)
    elif (energy < 5) and (mood >= 5):
        return low_energy_high_mood(energy,mood)
    elif (energy < 5) and (mood < 5):
        return low_energy_low_mood(energy,mood)
    elif (energy >= 5) and (mood < 5):
        return high_energy_low_mood(energy,mood)
    else:
        print('Oops, nothing happened')

