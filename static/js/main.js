// https://www.chartjs.org/docs/latest/samples/area/line-boundaries.html

// Rating by month view
// Rating by week view
// Arrow buttons to go to month/week previous/next

// Need initial week/month data
// Default view: week view, show Sun - Sun of this week
// Need to get entries from DB for this week

// DONE
// What are the dates for this week? -> get date range for this week
// - start_date: moment().day("Sunday");
// - end_date: start_date.add(7, 'days');

// Send date range via AJAX to DB, receive entries

// send dates as ISO: start_date.toISOString();
// - Need Flask GET route that can take in start/end date and respond w/ entries
// - query for entries w/ date range
//    
// Render mood/energy ratings of entries in Chart
// take in `chart` -> ChartJS object
// remove any previous data
// AJAX request for new entries
// turn entries into valid chartjs data format
// add new data
// update chart

//load intial view of one week
// start laying out update function .

function getStartEndDateWeek() {
  const startDate = moment().day('Sunday');
  const endDate = moment(startDate).add(7, 'days');
  return [ startDate, endDate ];
}

let allEntries;
let dateRange = [];
let moodRating = [];
let energyRating = [];
const [startDate, endDate] = getStartEndDateWeek();
const moodData = []
const energyData = []
let testingDateRange = [];
let entryDateList = []
let dateLabels = []


$.get(
  '/api/entries',
  {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString()
  },
  (res) => {
    console.log(res);
    allEntries = res;
    for (const prop of res) {
      dateRange.push(prop.created_at);
      moodRating.push(prop.mood_ranking);
      energyRating.push(prop.energy_ranking);
    }

    // Prepare date lists to be compared against each other to set up data sets for chart.    
    //Set dates into uniform format
    for (item of dateRange) {
      entryDateList.push(moment(item).format('MM-DD-YYYY'));
    }

    //get list of days for a week, format in the same way as the other list. 
    let weekDates = [];
    for (let i = 0; i < 7; i++) {
      weekDates.push(moment(startDate).add(i, 'days'));
      testingDateRange.push(moment(weekDates[i]).format('MM-DD-YYYY'));
    };
    
    //loop through list of dates, 
    //if date matches an entry, then place that into the list I'm sending "data"
    //if the date from the week does not match an entry, then add 1
    for (let i = 0; i < 7; i++) {
      idx = entryDateList.indexOf(testingDateRange[i]);
      dateLabels.push(moment(testingDateRange[i]).format('dddd, MMM Do'));
      console.log(idx);
      //if the index is found, push the mood rating data to moodData for the chart
      if (idx !== -1) {
        moodData.push(moodRating[idx]);
        energyData.push(energyRating[idx]);
      } else {
        moodData.push(1);
        energyData.push(1);
      }
    }
    
    //Send labels the entire week
    

    const config = {
      type: 'line',
        data: {
          labels: dateLabels,
          datasets: [{
              label: 'Your Mood',
              backgroundColor: 'rgb(45, 122, 255)',
              borderColor: 'rgb(45, 122, 255)',
              data: moodData,
            },{
              label: 'Your Energy',
              backgroundColor: 'rgb(0, 255, 119)',
              borderColor: 'rgb(0, 255, 119)',
              data: energyData,
            }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            suggstedMin: 10,
          },
          xAxes: [
            {
              type: 'time',
              distribution: 'series',
              beginAtZero: true,
            },
          ]
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


  }
);
  


// for (entry of getStartEndDateWeek()) {
//   dateRange.push(entry.created_at);
//   moodRating.push(entry.mood_ranking);
//   energyRating.push(entry.energy_ranking);
// };

  //CHART.JS CONFIG 

  

  //RENDER CHART.JS
  $("#remove-days").click(function(){
    setRange(5);
  });
  
  $("#add-days").click(function(){
    setRange(-5);
  });
