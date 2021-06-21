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

let dateRange = [];
let moodRating = [];
let energyRating = [];
const [startDate, endDate] = getStartEndDateWeek();
let moodData = []
let energyData = []
let dateLabels = [];
let calendarView = 'week';
let calendarPositionWeeks = 0;
let calendarPositionMonths = 0;
let myChartHasRendered;

  //BASE CONFIG


$.get(
  '/api/entries',
  {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString()
  },
  (res) => {
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
  }
);
    // Prepare date lists to be compared against each other to set up data sets for chart.    
    //Set dates from "user entries" into uniform format

function setUpChartData(start_date, date_range, mood_rating, energy_rating) {
  moodData = [];
  energyData = [];
  dateLabels = [];
  entryDateList = [];
  
  for (item of date_range) {
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
    console.log(testingDateRange)
  } else if (calendarView === 'month') {
    let monthDates = [];
    let daysInMonth = moment(start_date[0]).daysInMonth();

    for (let i = 0; i < daysInMonth; i++) {
      monthDates.push(moment(start_date).add(i, 'days'));
      testingDateRange.push(moment(monthDates[i]).format('MM-DD-YYYY'));
    };
    console.log(testingDateRange)
  } else {
    console.log('try again!');
  };

  // Start date should be default to this past sunday.
  // Start date will be saved from current rendering, and adjusted based on button click
    // adjustment will be through the add or subtract button, based on param input
    
  //loop through list of dates, 
  //if date matches an entry, then place that into the list I'm sending "data"
  //if the date from the week does not match an entry, then add 1

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
      moodData.push(0);
      energyData.push(0);
    }
  }    
  console.log([dateLabels, moodData, energyData]);
  return [dateLabels, moodData, energyData];
}


// With new "changeStartDate", we will retrieve the range of dates, and add the new data

function changeView(action) {
  if (action === 'month') {
    calendarView = 'month';
    changeStartDate = moment().startOf('month');
    changeEndDate = moment().endOf('month');
    console.log(changeStartDate);
    console.log(changeEndDate);
  } else if (action === 'week') {
    calendarView = 'week';
    changeStartDate = moment().startOf('week');
    changeEndDate = moment().endOf('week');
    console.log(changeStartDate);
    console.log(changeEndDate);
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
      console.log(res);
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
    }
  );
}

function changeRange(action) {
  if (calendarView === 'week' && action === 'prev') {
    calendarPositionWeeks -= 7;
    changeStartDate = moment().day('Sunday').add(calendarPositionWeeks, 'days');
    changeEndDate = moment(changeStartDate).endOf('week');
    console.log(changeStartDate);
    console.log(calendarPositionWeeks);
  } else if (calendarView === 'week' && action === 'next') {
    calendarPositionWeeks += 7;
    changeStartDate = moment().day('Sunday').add(calendarPositionWeeks, 'days');
    changeEndDate = moment(changeStartDate).endOf('week');
    console.log(changeStartDate);
    console.log(calendarPositionWeeks);
  } else if (calendarView === 'month' && action === 'prev') {
    calendarPositionMonths -= 1;
    changeStartDate = moment().add(calendarPositionMonths, 'months').startOf('month')
    changeEndDate = moment(changeStartDate).endOf('month');
    console.log(changeStartDate);
  } else if (calendarView === 'month' && action === 'next') {
    calendarPositionMonths += 1;
    changeStartDate = moment().add(calendarPositionMonths, 'months').startOf('month')
    changeEndDate = moment(changeStartDate).endOf('month');
    console.log(changeStartDate);
  } else {
    console.log('Try again!')
  }

  $.get(
    '/api/entries',
    {
      start_date: changeStartDate.toISOString(),
      end_date: changeEndDate.toISOString()
    },
    (res) => {
      console.log(res);
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
    }
  );
}

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
      x: [{
        display: false,
      }],
      y: [{
        display: false,
        ticks: {
          beginAtZero: true,
          //can't figure out how to get the chart 10 points high!
          //Also want to add in x for any time entry is 0
          suggestedMin: 1,
          suggestedMax: 10,
        },
      }]
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
    //RENDER CHART.JS
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

// for (entry of getStartEndDateWeek()) {
//   dateRange.push(entry.created_at);
//   moodRating.push(entry.mood_ranking);
//   energyRating.push(entry.energy_ranking);
// };

  //CHART.JS CONFIG 

  
