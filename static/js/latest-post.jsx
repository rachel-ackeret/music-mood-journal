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
    const [song, setSong] = React.useState(props.spotify_song_id);
    const [songImage, setSongImage] = React.useState(props.song_image);
    const [songPreview, setSongPreview] = React.useState(props.song_preview);
    const [songArtist, setSongArtist] = React.useState(props.song_artist);
    const [songName, setSongName] = React.useState(props.song_name);
    const [danceability, setDanceability] = React.useState(props.song_danceability);
    const [energy, setEnergy] = React.useState(props.song_energy);
    const [tempo, setTempo] = React.useState(props.song_tempo);

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
      quill_edit.root.innerHTML = bodyText;
    };
  
    const handleSaveModeButtonClick = () => {
      $('.ql-toolbar').remove();
      setEditable(!editable);

      //QUILL SAVE
      var journalEntry = document.querySelector('input[name=journal_entry_edit]');
      journalEntry.value = DOMPurify.sanitize(quill_edit.root.innerHTML);
      console.log(journalEntry.value)
      setBodyText(journalEntry.value)

      // Make post request to update rating in DB
      $.post(`/api/entry-edit/${props.entryId}`, ({mood_edit: moodRanking, energy_edit: energyRanking, journal_entry_edit: journalEntry.value}), (res) => {
        setMoodRanking(res.mood_ranking);
        setEnergyRanking(res.energy_ranking);
        setBodyText(res.body);
        setSong(res.spotify_song_id);
        setSongImage(res.song_image)
        setSongPreview(res.song_preview)
        setSongArtist(res.song_artist)
        setSongName(res.song_name)
        setDanceability(res.danceability)
        setEnergy(res.energy)
        setTempo(res.tempo)
      });
    };
    const handleEnergyChange = (e) => {
      editable ? setEnergyRanking(e.target.value) : setEnergyRanking(energyRanking);
    };
    const handleMoodChange = (e) => {
      editable ? setMoodRanking(e.target.value) : setMoodRanking(moodRanking);
    };
    const handleBodyChange = (e) => {
      editable ? setBodyText(DOMPurify.sanitize(quill_edit.root.innerHTML)) : setBodyText(bodyText);
    };
    return (
        <React.Fragment> 
          <div className="justify-content-center top-card container-sm position-relative p-lg-5">
                <h3 className="pt-5">Your latest entry on {props.created_at}</h3>
                <div className="pt-5 col-lg-8 justify-content-end d-lg-flex margin-center">
                  <button onClick={editable ? handleSaveModeButtonClick : handleEditModeButtonClick} className="edit-button btn neu-button-2">
                      {editable ? 'Save' : 'Edit'}<img src="./static/icons/edit.png" />
                  </button>
                </div>
                <div className="my-3 d-lg-flex justify-content-center">
                    <div className="card-module spotify-custom-setup p-4 d-lg-flex flex-column align-items-center col-lg-5 mx-4 position-relative">
                        {/* <a href="https://twitter.com/share?ref_src=twsrc%5Etfw" 
                        className="twitter-share-button" 
                        data-size="large" 
                        data-text="Check out how I&#39;m feeling today. I&#39;m really vibing with this song!" 
                        data-url={`https://open.spotify.com/track/${props.spotify_song_id}`} 
                        data-lang="en" 
                        data-show-count="false">Tweet</a> */}
                        <br />
                        <h4 className="song-title">{songName}</h4>
                        <p className="small song-artist">{songArtist}</p>
                        <a href={`https://open.spotify.com/track/${song}`} target="_blank">
                        <img src={songImage} className="shadow"/>
                        </a>
                        <audio controls="controls" className="my-4" style={{display: props.song_preview === null ? 'none' : null }}>
                            <source src={songPreview} type="audio/mpeg" />
                        </audio>
                      </div>
                    <div className="card-module col-lg-3 mx-4 p-4">
                   
                    <input type="range" name="energy" min="1" max="10" value={energyRanking} onChange={handleEnergyChange}/>    
                    <p>Your energy: {energyRanking}</p>
                    <input type="range" name="mood" min="1" max="10" value={moodRanking} onChange={handleMoodChange}/>
                    <p>Your mood: {moodRanking}</p>
                    <h5 className="mt-lg-5 mt-3 pb-4">Song specs:</h5>
                    <div className = "d-flex justify-content-center py-4">
                    <input className ="vertical range_sliders col-4" type="range" min="0" max="1" step=".01" value={danceability} readOnly/>
                    <input className ="vertical range_sliders col-4" type="range" min="0" max="1" step=".01" value={energy} readOnly/>
                    <input className ="vertical range_sliders col-4" type="range" min="30" max="160" step="1" value={tempo} readOnly/>
                    </div>
                    <div className = "d-flex justify-content-center pt-md-4 pt-5">
                      <p className="sideways">Danceability</p>
                      <p className="sideways">Energy</p>
                      <p className="sideways">Tempo</p>
                    </div>
                  </div>    
                </div>  
                <div className="p-5 card-module col-lg-8 margin-center d-lg-flex">
                  
                  <div className="col-lg-9">
                    <h5>Journal Entry</h5>
                    <div dangerouslySetInnerHTML={{ __html: bodyText }}></div>
                      <div style={{display: editable ? null : 'none' }} >
                        <div className="the-quill-editor">
                          <input name="journal_entry_edit" value="bodyText" type="hidden"/>    
                          <div id="edit-existing-entry"></div>
                        </div>
                      </div>
                  </div>
                  <div className="p-3 mb-lg-0 mb-1 weather-section margin-center col-lg-2" style={{display: props.weather_description === null ? 'none' : null }}>
                      <img src={props.second_weather_icon} alt="{`${props.weather_description}`}"/>
                      <div className="">
                        <p className="weather-text text-center">{props.weather_description}<br></br>{props.temperature}&deg;</p>
                      </div>
                    </div>  
                </div>
                <div className="pt-3 mb-5 justify-content-center d-lg-flex margin-center">
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
            song_danceability={singleEntry.danceability}
            song_energy={singleEntry.energy}
            song_tempo={singleEntry.tempo}
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