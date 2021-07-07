// https://www.chartjs.org/docs/latest/samples/area/line-boundaries.html


function getStartEndDateWeek() {
    const startDate = moment().day('Sunday');
    const endDate = moment(startDate).add(7, 'days');
    return [ startDate, endDate ];
  }

  let allEntries = []  
  const dateRange = [];
  let moodRating = [];
  let energyRating = [];
  const [startDate, endDate] = getStartEndDateWeek();
  let moodData = []
  let energyData = []
  let dateLabels = [];
  let calendarView = 'week';
  let calendarPositionWeeks = 0;
  let calendarPositionMonths = 0;
  

  const mojis = ['./static/icons/1-emoji.png', 
  './static/icons/2-emoji.png', 
  './static/icons/3-emoji.png', 
  './static/icons/4-emoji.png',
  './static/icons/5-emoji.png', 
  './static/icons/6-emoji.png',
  './static/icons/7-emoji.png', 
  './static/icons/8-emoji.png',
  './static/icons/9-emoji.png', 
  './static/icons/10-emoji.png'];

const energies = ['./static/icons/1-energy.png', 
  './static/icons/2-energy.png', 
  './static/icons/3-energy.png', 
  './static/icons/4-energy.png',
  './static/icons/5-energy.png', 
  './static/icons/6-energy.png',
  './static/icons/7-energy.png', 
  './static/icons/8-energy.png',
  './static/icons/9-energy.png', 
  './static/icons/10-energy.png'];

    //BASE CONFIG
  
  $.get(
    '/api/entries/',
    {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    },
    (res) => {
        allEntries = res;
      for (const prop of res) {
        dateRange.push(prop.created_at);
        moodRating.push(prop.mood_ranking);
        energyRating.push(prop.energy_ranking);
      }
      [ dateLabels, moodData, energyData ] = setUpChartData(startDate, dateRange, moodRating, energyRating);
      myChart.data.labels = dateLabels;
      myChart.data.datasets[0].data = moodData;
      myChart.data.datasets[1].data = energyData;
      myChart.update();
      renderReactTwo();
    }
  );
      // Prepare date lists to be compared against each other to set up data sets for chart.    
      //Set dates from "user entries" into uniform format
  
  function setUpChartData(start_date, date_range, mood_rating, energy_rating) {
    moodData = [];
    energyData = [];
    dateLabels = [];
    let entryDateList = [];
    
    for (let item of date_range) {
      entryDateList.push(moment(item).format('MM-DD-YYYY'));
    }
    //get list of days for one week or month, format in the same way as the other list. 
  
    let testingDateRange = [];
  
    if (calendarView === 'week') {
      let weekDates = [];
      for (let i = 0; i < 7; i++) {
        weekDates.push(moment(start_date).add(i, 'days'));
        testingDateRange.push(moment(weekDates[i]).format('MM-DD-YYYY'));
      };
    } else if (calendarView === 'month') {
      let monthDates = [];
      let daysInMonth = moment(start_date[0]).daysInMonth();
  
      for (let i = 0; i < daysInMonth; i++) {
        monthDates.push(moment(start_date).add(i, 'days'));
        testingDateRange.push(moment(monthDates[i]).format('MM-DD-YYYY'));
      };
    } else {
      console.log('try again!');
    };
  
  
    for (let i = 0; i < testingDateRange.length; i++) {
      let idx = entryDateList.indexOf(testingDateRange[i]);
      //Create date labels for the chart in correct format.
      dateLabels.push(moment(testingDateRange[i]).format('dddd, MMM Do'));
      //if the index is found, push the mood rating data to moodData for the chart
      //or if the date is beyond today, end the loop and don't add data to moodData
      //if no entry found for previous days, add zero to list. Hope to change later
      if (idx !== -1) {
        moodData.push(mood_rating[idx]);
        energyData.push(energy_rating[idx]);
      } else if (testingDateRange[i] >= moment().format('MM-DD-YYYY')) {
        break;
      } else {
        moodData.push(null);
        energyData.push(null);
      }
    }    
    return [dateLabels, moodData, energyData];
  }
  
  
  // With new "changeStartDate", we will retrieve the range of dates, and add the new data
  let changeStartDate = null;
  let changeEndDate = null;
  function changeView(action) {
    if (action === 'month') {
      calendarView = 'month';
      changeStartDate = moment().startOf('month');
      changeEndDate = moment().endOf('month');
    } else if (action === 'week') {
      calendarView = 'week';
      changeStartDate = moment().startOf('week');
      changeEndDate = moment().endOf('week');
    } else {
      console.log('try again!')
    }
  
    $.get(
      '/api/entries',
      {
        start_date: changeStartDate.toISOString(),
        end_date: changeEndDate.toISOString()
      },
      (res) => {
        allEntries = res;
        for (const prop of res) {
          dateRange.push(prop.created_at);
          moodRating.push(prop.mood_ranking);
          energyRating.push(prop.energy_ranking);
        }
        [ dateLabels, moodData, energyData ] = setUpChartData(changeStartDate, dateRange, moodRating, energyRating);
        myChart.data.labels = dateLabels;
        myChart.data.datasets[0].data = moodData;
        myChart.data.datasets[1].data = energyData;
        myChart.update();
        renderReactTwo();
      }
    );
  }
  
  function changeRange(action) {
    if (calendarView === 'week' && action === 'prev') {
      calendarPositionWeeks -= 7;
      changeStartDate = moment().day('Sunday').add(calendarPositionWeeks, 'days');
      changeEndDate = moment(changeStartDate).endOf('week');
    } else if (calendarView === 'week' && action === 'next') {
      calendarPositionWeeks += 7;
      changeStartDate = moment().day('Sunday').add(calendarPositionWeeks, 'days');
      changeEndDate = moment(changeStartDate).endOf('week');
    } else if (calendarView === 'month' && action === 'prev') {
      calendarPositionMonths -= 1;
      changeStartDate = moment().add(calendarPositionMonths, 'months').startOf('month')
      changeEndDate = moment(changeStartDate).endOf('month');
    } else if (calendarView === 'month' && action === 'next') {
      calendarPositionMonths += 1;
      changeStartDate = moment().add(calendarPositionMonths, 'months').startOf('month')
      changeEndDate = moment(changeStartDate).endOf('month');
    } else {
      console.log('Try again!')
    }

    $.get(
      '/api/entries',
      {
        entry_date: changeStartDate.toISOString(),
      },
      (res) => {
        allEntries = res;
        for (const prop of res) {
          dateRange.push(prop.created_at);
          moodRating.push(prop.mood_ranking);
          energyRating.push(prop.energy_ranking);
        }
        [ dateLabels, moodData, energyData ] = setUpChartData(changeStartDate, dateRange, moodRating, energyRating);
        myChart.data.labels = dateLabels;
        myChart.data.datasets[0].data = moodData;
        myChart.data.datasets[1].data = energyData;
        myChart.update();
        renderReactTwo();
      }
    );
  }
  
  const config = {
    type: 'line',
      data: {
        labels: dateLabels,
        datasets: [{
            label: 'Your Mood',
            spanGaps: true,
            backgroundColor: 'rgb(45, 122, 255)',
            borderColor: 'rgb(45, 122, 255)',
            data: moodData,
          },{
            label: 'Your Energy',
            spanGaps: true,
            backgroundColor: 'rgb(0, 255, 119)',
            borderColor: 'rgb(0, 255, 119)',
            data: energyData,
          }]
    },
    options: {
      responsive: true,
      scales: {
        yAxis: {
          display: true,
          min: 1,
          max: 10,
          stepSize: 1
          },
        },
      elements: {
        line: {
          tension: 0.45
        },        
      },
    }
  };  
  let myChart = new Chart(
    document.getElementById('myChart'),
    config
  );
  

function JournalEntry(props) {

    return (
            <div className="entry-module journal-entry-module my-5 p-5 d-lg-flex justify-content-center text-center n-shadow" id={props.id}>
              <div className="section col-lg-6">
                <h3 className="mb-lg-5 mb-3">Entry on {props.created_at}</h3>
                <div className="p-3 mb-3 weather-section margin-center" style={{display: props.weather_description === null ? 'none' : null }}>
                  <img className="margin-center" src={props.second_weather_icon} alt="{`${props.weather_description}`}"/>
                  <div className="">
                    <p className="weather-text text-center">{props.weather_description}<br></br>{props.temperature}&deg;</p>
                  </div>
                </div>  
                <div className="d-flex my-5 justify-content-around">
                  <div className="d--flex flex-column">
                  <h5>Mood:</h5><img src={props.moodEmoji} />
                  </div>
                  <div className="d--flex flex-column">
                  <h5>Energy:</h5> <img src={props.energyEmoji} />
                  </div>
                </div>
                <div className="bg-white p-3 rounded">
                  <h5>Your thoughts for the day:</h5>
                  <div dangerouslySetInnerHTML={{ __html: props.body }}></div>
                </div>
              </div>
              <div className="border-left-module spotify-custom-setup m-3 p-lg-3 col-lg-5">
                <h4 className="song-title">{props.song_name}</h4>
                <p className="small song-artist">{props.song_artist}</p>
                <a href={`https://open.spotify.com/track/${props.spotify_song_id}`} target="_blank">
                  <img src={props.song_image} className="shadow"/>
                </a>
                <audio controls="controls" className="my-4" style={{display: props.song_preview === null ? 'none' : null }}>
                  <source src={props.song_preview} type="audio/mpeg" />
                </audio>
                <hr />
                <div className = "d-flex justify-content-around py-5 ">
                    <input className ="vertical range_sliders col-3" type="range" min="0" max="1" step=".01" value={props.danceability} readOnly/>
                    <input className ="vertical range_sliders col-3" type="range" min="0" max="1" step=".01" value={props.energy} readOnly/>
                    <input className ="vertical range_sliders col-3" type="range" min="30" max="160" step="1" value={props.tempo} readOnly/>
                    </div>
                    <div className = "d-flex justify-content-around mt-2 pt-lg-5 pt-3">
                      <p className="sideways">Danceability</p>
                      <p className="sideways">Energy</p>
                      <p className="sideways">Tempo</p>
                    </div>
              </div>
            </div>
    );
  }
// define TradingCardContainer component
function GenerateJournalEntries() {
  //create empty list called paragraphs
  const journalEntriesProps = [];
    for (let entry of allEntries) {
      let formatted_date = moment(entry.created_at).format('dddd, MMMM Do, YYYY');
      let energyEmoji = energies[entry.energy_ranking - 1];
      let moodEmoji = mojis[entry.mood_ranking - 1];
      journalEntriesProps.push(
        <JournalEntry
          key={entry.id}
          body={entry.body}
          created_at={formatted_date}
          energyEmoji={energyEmoji}
          moodEmoji={moodEmoji}
          spotify_song_id={entry.spotify_song_id}
          user_id={entry.user_id}
          energy_ranking={entry.energy_ranking}
          mood_ranking={entry.mood_ranking}
          weather_description={entry.weather_description}
          weather_icon={entry.weather_icon}
          second_weather_icon={entry.second_weather_icon}
          temperature={entry.temperature}
          song_preview={entry.song_preview}
          song_image={entry.song_image}
          song_artist={entry.song_artist}
          song_name={entry.song_name}
          danceability={entry.danceability}
          energy={entry.energy}
          tempo={entry.tempo}
        />
      );
    }
    return (
      <React.Fragment>
        {journalEntriesProps}
      </React.Fragment>
    );
  }

function renderReactTwo() 
{
  ReactDOM.render( 
    <GenerateJournalEntries/>,
    document.querySelector('#test-journal-entries')
  );
}

  
  $("#previous-view").click(function(){
    changeRange('prev');
  });
  
  $("#next-view").click(function(){
    changeRange('next');
  });
  
  $("#month-view").click(function(){
    changeView('month');
  });
  
  $("#week-view").click(function(){
    changeView('week');
  });
  