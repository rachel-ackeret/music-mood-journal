'use strict';

/*
class MoodRating extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editMode: "Off" };
  }



  toggle () {
    if (this.editMode = "Off") {
      return this.setState({editMode: 'On'})
    }
    else {
      return  this.setState({editMode: 'Off'})
    }
  }

  render() {
    return ( <div>
      <button onClick={() => {toggle}}>
      Edit
      </button></div>
      )
  }
} */

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

function EditableMoodRating(props) {
  const [rating, setRating] = React.useState(props.rating);
  const [editable, setEditable] = React.useState(false);
  
  // Toggle edit mode (ex.: if `editable` === true, set to false)
  const handleEditModeButtonClick = () => {
    setEditable(!editable);    
  };

  const handleSaveModeButtonClick = () => {
    setEditable(!editable)
  };

  const handleRatingChange = (e) => {
    setRating(e.target.value);
    console.log(rating);
  }

  return (
    <div>
      <pre><b>DEBUG:</b> rating: {rating}, editable: {editable}</pre>

      <button onClick={editable ? handleSaveModeButtonClick : handleEditModeButtonClick}>
        {editable ? 'Save' : 'Edit Me'}
      </button>
      <div style={{display: editable ? 'block' : 'none' }}>
        <p>Rank your mood today from Low to High</p>
        <input type="range" name="happiness" min="1" max="10" value={rating} onChange={handleRatingChange}/>
      </div>
    </div>
  );

} 


ReactDOM.render(
  <EditableMoodRating rating={3} />,
  document.querySelector('#test-mood-rating')
);
