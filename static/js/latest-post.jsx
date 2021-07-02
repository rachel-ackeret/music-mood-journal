'use strict';

let singleEntry = null;
let quill_edit;

$.get(
    '/api/entries/last/',
    {},
    (res) => {
      singleEntry = res;
      renderReact();
    }
  );
  
  //BODY TEXT 
function LatestJournalEntry(props) {
    const [editable, setEditable] = React.useState(false);
    const [energyRanking, setEnergyRanking] = React.useState(props.energy_ranking);
    const [moodRanking, setMoodRanking] = React.useState(props.mood_ranking);
    const [bodyText, setBodyText] = React.useState(props.body);
    // const [song, setSong] = React.useState(props.song_details);
    
    // Toggle edit mode (ex.: if `editable` === true, set to false)
    const handleEditModeButtonClick = () => {
      setEditable(!editable);    

      quill_edit = new Quill('#edit-existing-entry', {
        modules: {
            toolbar: true
          },
          theme: 'snow'
      });
    };
  
    const handleSaveModeButtonClick = () => {
      $('.ql-toolbar').remove();
      setEditable(!editable);

      //QUILL SAVE
      var journalEntry = document.querySelector('input[name=journal_entry_edit]');
      journalEntry.value = quill_edit.root.innerHTML;
      setBodyText(journalEntry.value)

      // Make post request to update rating in DB
      $.post(`/api/entry-edit/${props.entryId}`, ({mood_edit: moodRanking, energy_edit: energyRanking, journal_entry_edit: bodyText}), (res) => {
        console.log(res)
        setMoodRanking(res.mood_ranking);
        setEnergyRanking(res.energy_ranking);
        setBodyText(res.body);
        setSong(res.song_details);
      });
    };
    const handleEnergyChange = (e) => {
      editable ? setEnergyRanking(e.target.value) : setEnergyRanking(energyRanking);
    };

    const handleMoodChange = (e) => {
      editable ? setMoodRanking(e.target.value) : setMoodRanking(moodRanking);
    };
    return (
        <React.Fragment> 
          <div className="justify-content-center top-card container-sm position-relative p-5">
                <h3 className="pt-5">Your latest entry on {props.created_at}</h3>
                <div className="pt-5 col-8 justify-content-end d-flex margin-center">
                  <button onClick={editable ? handleSaveModeButtonClick : handleEditModeButtonClick} className="edit-button btn neu-button-2">
                      {editable ? 'Save' : 'Edit'}<img src="./static/icons/edit.png" />
                  </button>
                </div>
                <div className="my-3 d-flex justify-content-center">
                    <div className="card-module spotify-custom-setup p-4 d-flex flex-column align-items-center col-5 mx-4 position-relative">
                        <a href="https://twitter.com/share?ref_src=twsrc%5Etfw" 
                        className="twitter-share-button" 
                        data-size="large" 
                        data-text="Check out how I&#39;m feeling today. I&#39;m really vibing with this song!" 
                        data-url={`https://open.spotify.com/track/${props.spotify_song_id}`} 
                        data-lang="en" 
                        data-show-count="false">Tweet</a>
                        <br />
                        <h4 className="song-title">{props.song_name}</h4>
                        <p className="small song-artist">{props.song_artist}</p>
                        <a href={`https://open.spotify.com/track/${props.spotify_song_id}`} target="_blank">
                        <img src={props.song_image} className="shadow"/>
                        </a>
                        <audio controls="controls" className="my-4" style={{display: props.song_preview === null ? 'none' : null }}>
                            <source src={props.song_preview} type="audio/mpeg" />
                        </audio>
                      </div>
                    <div className="card-module col-3 mx-4 p-4">
                    <div className="p-3 mb-3 weather-section margin-center" style={{display: props.weather_description === null ? 'none' : null }}>
                      <img src={props.second_weather_icon} alt="{`${props.weather_description}`}"/>
                      <div className="">
                        <p className="weather-text text-center">{props.weather_description}<br></br>{props.temperature}&deg;</p>
                      </div>
                    </div>  
                    <input type="range" name="energy" min="1" max="10" value={energyRanking} onChange={handleEnergyChange}/>    
                    <p>Your energy: {energyRanking}</p>
                    <input type="range" name="mood" min="1" max="10" value={moodRanking} onChange={handleMoodChange}/>
                    <p>Your mood: {moodRanking}</p>
                  </div>    
                </div>  
                <div className="p-5 card-module col-8 margin-center">
                  <h5>Journal Entry</h5>
                  <div dangerouslySetInnerHTML={{ __html: props.body }}></div>
                  <div style={{display: editable ? null : 'none' }} >
                    <div className="the-quill-editor">
                      <input name="journal_entry_edit" type="hidden"/>    
                      <div id="edit-existing-entry"></div>
                    </div>
                  </div>
                </div>
                <div className="pt-3 mb-5 justify-content-center d-flex margin-center">
                  <button onClick={editable ? handleSaveModeButtonClick : handleEditModeButtonClick} className="edit-button btn neu-button-2">
                      {editable ? 'Save' : 'Edit'}<img src="./static/icons/edit.png" />
                  </button>
                </div>
            </div>
        </React.Fragment>
    );
  }

function TopJournalEntry() {
        let formatted_date = moment(singleEntry.created_at).format('dddd, MMMM Do');
        const journalEntriesProps = 
        <LatestJournalEntry
            entryId={singleEntry.id}
            body={singleEntry.body}
            created_at={formatted_date}
            spotify_song_id={singleEntry.spotify_song_id}
            user_id={singleEntry.user_id}
            energy_ranking={singleEntry.energy_ranking}
            mood_ranking={singleEntry.mood_ranking}
            weather_description={singleEntry.weather_description}
            weather_icon={singleEntry.weather_icon}
            second_weather_icon={singleEntry.second_weather_icon}
            temperature={singleEntry.temperature}
            song_preview={singleEntry.song_preview}
            song_image={singleEntry.song_image}
            song_artist={singleEntry.song_artist}
            song_name={singleEntry.song_name}
          />
      return (
        <React.Fragment>
          {journalEntriesProps}
        </React.Fragment>
      );
    }
  
  function renderReact() {
    ReactDOM.render( 
      <TopJournalEntry/>,
      document.querySelector('#latest-post')
    );
  }

