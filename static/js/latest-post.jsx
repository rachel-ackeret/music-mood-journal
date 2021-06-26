'use strict';

let singleEntry = null;

$.get(
    '/api/entries/last/',
    {},
    (res) => {
      singleEntry = res;
      console.log(singleEntry);
      renderReact();
    }
  );

  //BODY TEXT 
function LatestJournalEntry(props) {
    const [bodyText, setBodyText] = React.useState(props.body);
    const [editable, setEditable] = React.useState(false);
    
    // Toggle edit mode (ex.: if `editable` === true, set to false)
    const handleEditModeButtonClick = () => {
      setEditable(!editable);    
      console.log('I am setting state to edit.')
    };
  
    const handleSaveModeButtonClick = () => {
      setEditable(!editable);
      var journalEntry = document.querySelector('input[name=journal_entry_edit]');
      journalEntry.value = quill_edit.root.innerHTML;
      console.log(journalEntry.value)
      let newValue = journalEntry.value
      console.log('I am setting state to saved.')
  
      // Make post request to update rating in DB
      $.post(`/api/entry-edit/${props.entryId}`, {journal_entry_edit: newValue}, (res) => {
        console.log(res);
        console.log('saving update to database through flask')
        setBodyText(res.body);
      });
    };

    const handleCloseButtonClick = () => {
        console.log('here');
        $('.top-grid').css('display', 'none');
        $('.top-grid').remove();
    };
    return (
        <React.Fragment> 
            <div className="shadow my-3 p-4 rounded top-card position-relative col-lg-9 align-self-center bg-light">
                <h3>Your latest entry on {props.created_at}</h3>
                <button onClick={handleCloseButtonClick} 
                type="button" className="btn btn-outline-secondary close-button m-3" id="close-post">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                        <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z"></path>
                    </svg>
                    <span className="visually-hidden">Button</span>
                </button>
                <div className="d-lg-flex mt-5">
                    <div className="spotify-custom-setup p-1 col-lg-4 margin-center">
                        <h4 className="my-4 song-title">Song title goes here</h4>
                        <h5 className="my-4 song-artist">Song artist goes here</h5>
                        <a href={`https://open.spotify.com/track/${props.spotify_song_id}`} target="_blank">
                        <img src={props.song_image} className="shadow"/>
                        </a>
                        <audio controls="controls" className="my-4" style={{display: props.song_preview === null ? 'none' : null }}>
                            <source src={props.song_preview} type="audio/mpeg" />
                        </audio>
                        <br />
                        <a href="https://twitter.com/share?ref_src=twsrc%5Etfw" 
                        className="twitter-share-button" 
                        data-size="large" data-text="Check out how I&#39;m feeling today. I&#39;m really vibing with this song :) " 
                        data-url={`https://open.spotify.com/track/${props.spotify_song_id}`} 
                        data-lang="en" 
                        data-show-count="false">Tweet</a>
                    </div>            
                    <div className="col-lg-8">
                        <div className="p-2 weather-section col-lg-7 margin-center" style={{display: props.weather_description === null ? 'none' : null }}>
                            <div className="d-lg-flex align-items-center justify-content-center">
                                <p className="weather-text text-align-center col-6">{props.temperature}&deg;</p>
                                <img className = "col-6" src={props.second_weather_icon} alt="{`${props.weather_description}`}"/>
                            </div>
                            <p className="weather-text text-align-center">{props.weather_description}</p>
                        </div>
                        <div className="p-3"></div>
                            <button onClick={editable ? handleSaveModeButtonClick : handleEditModeButtonClick} id="form-edit" type="button" className="btn btn-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fillRule="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"></path>
                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"></path>
                                </svg>
                                &nbsp;{editable ? 'Save' : 'Edit Entry'}
                            </button>
                            <p>Your mood today was {props.mood_ranking}</p>
                            <p>You had "high or low" energy {props.energy_ranking}</p>
                            <p>This is what you're feeling:</p>
                            <p>{ props.body }</p>
                        </div>
                        <div style={{display: editable ? null : 'none' }}>
                            <div className="the-quill-editor">
                                <input name="journal_entry_edit" type="hidden"/>    
                                <div id="edit-existing-entry"></div>
                            </div>
                        </div>
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

//Set up Quill
