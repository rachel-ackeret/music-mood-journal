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
  
    //BASE CONFIG
  
  $.get(
    '/api/entries/',
    {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    },
    (res) => {
        allEntries = res;
      console.log(res);
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
      console.log('render!');
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
        <div className="card bg-white shadow rounded my-3" >
            <div className="card-body" id={props.id}>
                <h3>Entry on {props.created_at}</h3>
                <p>{ props.body }</p>
                <p>Mood: {props.mood_ranking}</p>
                <p>Energy: {props.energy_ranking}</p>
                <audio controls="controls" style={{display: props.song_preview === null ? 'none' : null }}>
                  <source src={props.song_preview} type="audio/mpeg"/>
                </audio>
                <div style={{display: props.weather_description === null ? 'none' : null }}>
                <p>{props.temperature} &deg;</p>
                <img className ="col-3" src={props.second_weather_icon} alt="{`${props.weather_description}`}"/>
                
                </div>
            </div>
          </div>
    );
  }
// define TradingCardContainer component
function GenerateJournalEntries() {
  //create empty list called paragraphs
  console.log(allEntries);
  const journalEntriesProps = [];
    for (let entry of allEntries) {
      journalEntriesProps.push(
        <JournalEntry
          key={entry.id}
          body={entry.body}
          created_at={entry.created_at}
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
  console.log('render!');
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
  