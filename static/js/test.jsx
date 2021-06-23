'use strict';


let allEntries = []

$.get(
  '/api/entries/',
  (res) => {
      console.log(res);
      allEntries = res;
      renderReact()
  }
);

function JournalEntry(props) {
    return (
        <div className="card bg-white shadow rounded my-3" >
            <div className="card-body" id={props.id}>
                <h3>Entry on {props.created_at}</h3>
                <p>{ props.body }</p>
                <p>{props.spotify_song_id}</p>
                <p>Mood: {props.mood_ranking}</p>
                <p>Energy: {props.energy_ranking}</p>
            </div>
          </div>
    );
  }
// define TradingCardContainer component
function GenerateJournalEntries() {
  //create empty list called paragraphs
  const journalEntriesProps = [];
    for (let entry of allEntries) {
      journalEntriesProps.push(
        <JournalEntry
          key={entry.id}
          id={entry.id}
          body={entry.body}
          created_at={entry.created_at}
          spotify_song_id={entry.spotify_song_id}
          user_id={entry.user_id}
          energy_ranking={entry.energy_ranking}
          mood_ranking={entry.mood_ranking}
        />
      );
    }
    return (
      <React.Fragment>
        {journalEntriesProps}
      </React.Fragment>
    );
  }

function renderReact() {
  ReactDOM.render( 
    <GenerateJournalEntries/>,
    document.querySelector('#test-journal-entries')
  );
  }