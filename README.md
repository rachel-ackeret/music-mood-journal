
# Musical Mood Journal
A journal interface using the Spotipy API to match a user input with a song and save to a journal entry.

https://www.youtube.com/watch?v=IZ8usX6VDjI

Features: 
- Ability to choose top 3 genres to seed into Spotify API recommendation.
- Sliders with visual representations of the mood/energy recording for the day.
- Weather recorded for day of data entry, matched with an external weather icon set. Using OpenWeatherAPI.
- Chart using Chart.JS displaying the range of moods a user has had for a scannable set of time.
- WYSWIG editor using Quill.JS to make semantically marked up user journal entries.
- Edit and save button using React.JS to update the latest entry.
- sliders representing the specific song attributes, in order to show the relevance to a user's mood & energy inputs. (to be refined!)

**Setup**
- Download files, and install requirements from requirements.txt into your virtual environment.
- Request API keys from both Spotify and OpenWeather API. Save these to your secrets.sh using the variable names in the code.
- Run in Python3 using Flask.

________________________________________________________

How to use the app:
1. Create Account, or Log in
![Log In / Create Account](https://user-images.githubusercontent.com/43709904/124631284-3d792980-de51-11eb-8300-e513c4e28886.png)

2. Choose or update your preferred music genres
![Genre Choice](https://user-images.githubusercontent.com/43709904/124632556-74037400-de52-11eb-9e78-e4efd600ad1c.png)

3. Use Sliders to fill out mood ranking
![Fill Mood and Energy](https://user-images.githubusercontent.com/43709904/124631427-60a3d900-de51-11eb-8eab-4d9083235832.png)

4. Fill out a journal entry of why you are feeling your energy and mood level.
![Write Journal Entry](https://user-images.githubusercontent.com/43709904/124631563-84671f00-de51-11eb-8a6a-4073a5afdc81.png)

5. Review your latest entry. You have the option to edit anything, which will update the song if you change your mood/energy input.
![Review Entry](https://user-images.githubusercontent.com/43709904/124631767-b2e4fa00-de51-11eb-8b6c-a0f4b4cfa217.png)

6. Review your energy and mood levels on this line graph. 
![Review Graph](https://user-images.githubusercontent.com/43709904/124631985-e9227980-de51-11eb-9e2a-70d92fc720a6.png)

7. Browse the rest of your previous journal entries
![Other Journal Entries](https://user-images.githubusercontent.com/43709904/124632264-30106f00-de52-11eb-9f01-7d721133b1bb.png)




