
class MoodRating extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editMode: "Off" };
  }
  render() {
    return ( <div><a href="">Edit</a></div>
      )
  }
};

ReactDOM.render( 
  React.createElement(MoodRating),
  document.querySelector(".mood-edit-react-component")
);