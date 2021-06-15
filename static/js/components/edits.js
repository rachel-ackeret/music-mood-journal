'use strict';


// SPEC
// Mood rating componenet needs to display mood rating [done]
// component needs to have a button to click to turn on edit mode [done]
// When edit mode on: slide should appear.
// User can update slider and save. New Mood rating should appear after save.

// STATE
// Mood Rating number
// Edit Mode status

// PROPS
// Initial Mood Rating

//MOOD RATING
function EditableMoodRating(props) {
    const [rating, setRating] = React.useState(props.rating);
    const [editable, setEditable] = React.useState(false);
    
    // Toggle edit mode (ex.: if `editable` === true, set to false)
    const handleEditModeButtonClick = () => {
      setEditable(!editable);    
    };
  
    const handleSaveModeButtonClick = () => {
      setEditable(!editable);
  
      // Make post request to update rating in DB
      $.post(`/api/entry-edit/${props.entryId}`, {happiness: rating}, (res) => {
        console.log(res);
  
        setRating(res.mood_ranking);
      });
    };
  
    const handleRatingChange = (e) => {
      setRating(e.target.value);
    };
  
    return (
      <div>
        <button onClick={editable ? handleSaveModeButtonClick : handleEditModeButtonClick}>
          {editable ? 'Save' : 'Edit Me'}
        </button>
        <div style={{display: editable ? null : 'none' }}>
          <p>Rank your mood today from Low to High</p>
          <input type="range" name="happiness" min="1" max="10" value={rating} onChange={handleRatingChange}/>
        </div>
        <p>Mood: {rating}</p>
      </div>
    );
  } 
  
  
  // ENERGY RATING 
  function EditableEnergyRating(props) {
    const [rating, setRating] = React.useState(props.rating);
    const [editable, setEditable] = React.useState(false);
    
    // Toggle edit mode (ex.: if `editable` === true, set to false)
    const handleEditModeButtonClick = () => {
      setEditable(!editable);    
    };
  
    const handleSaveModeButtonClick = () => {
      setEditable(!editable);
  
      // Make post request to update rating in DB
      $.post(`/api/entry-edit/${props.entryId}`, {energy: rating}, (res) => {
        console.log(res);
  
        setRating(res.energy_ranking);
      });
    };
  
    const handleRatingChange = (e) => {
      setRating(e.target.value);
    };
  
    return (
      <div>
        <button onClick={editable ? handleSaveModeButtonClick : handleEditModeButtonClick}>
          {editable ? 'Save' : 'Edit Me'}
        </button>
        <div style={{display: editable ? null : 'none' }}>
          <p>Rank your energy today from Low to High</p>
          <input type="range" name="energy" min="1" max="10" value={rating} onChange={handleRatingChange}/>
        </div>
        <p>Energy: {rating}</p>
      </div>
    );
  } 
  
  //BODY TEXT 
function EditableBodyText(props) {
    const [bodyText, setBodyText] = React.useState(props.bodyText);
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
    return (
      <div>
        <button onClick={editable ? handleSaveModeButtonClick : handleEditModeButtonClick} id="form-edit">
        {editable ? 'Save' : 'Edit Me'}
        </button>
        <div style={{display: editable ? null : 'none' }}>
          <p>Edit your journal entry for this day</p>
          <div className="the-quill-editor">
            <input name="journal_entry_edit" type="hidden"/>    
            <div id="edit-existing-entry"></div>
          </div>
        </div>
        <p>Journal Entry: {bodyText}</p>
        
      </div>
    );
  } 
  
 /// Testing AJAX
let userclass = {}
function getDatabaseEntry(entryId) {             
    $.ajax({    //create an ajax request to Flask Route for database return
        type: "POST",
        url: `/api/entry/${entryId}`,             
        dataType: "json",             
        success: function(response){                    
            userclass = response;
        }
    });
    return userclass;
}


  ReactDOM.render(
    <EditableMoodRating entryId={60} rating={5} />,
    document.querySelector('#mood-rating')
  );
  
  ReactDOM.render(
    <EditableEnergyRating entryId={60} rating={3} />,
    document.querySelector('#energy-rating')
  );
  
  ReactDOM.render(
    <EditableBodyText entryId={60} bodyText={'not too bad'} />,
    document.querySelector('#body-text')
  );


//Set up Quill
var quill_edit = new Quill('#edit-existing-entry', {
    modules: {
        toolbar: true
      },
      theme: 'snow'
});

// export { EditMoodRanking, EditEnergyRanking, EditBodyText };