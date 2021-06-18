



  // // get last 7 days from date provided
  // function lastWeek (d) {
  //   let result = [];
  //   for (let i=0; i<7; i++) {
  //       result.push(d.setDate(d.getDate() - i));
  //   }
  //   return(result);
  // }

// SETUP CHART.JS DATA
let numInput = -5;
get_params = {}
// get today
const todaysDate = new Date();

$.get('/api/entries', get_params, (res) => {
  console.log(res);
  let journalDate = [];
  let moodRating = [];
  let energyRating = [];
  allEntries = res;
  for (entry of res) {
    journalDate.push(moment(entry.created_at).format('MMMM Do'));
    moodRating.push(entry.mood_ranking);
    energyRating.push(entry.energy_ranking);
  };

  const footer = (tooltipItems) => {
    let postHref = '';
  
    tooltipItems.forEach(function(tooltipItem) {
      postHref = tooltipItem.parsed.journalDate;
    });
    return '<a href="#">Jump to Entry</a>';
  };
  

//SELECT DATE RANGE

  let dateRange = journalDate.slice(numInput);
  let moodRatingRange = moodRating.slice(numInput);
  let energyRatingRange = energyRating.slice(numInput);

  //Click handlers for buttons


  //Process chart breadth change
  function setRange(action) {
    console.log('here')
    numInput += action;
    console.log(numInput);
    if (numInput <= -30) {
      numInput = -30;
    }
    if (numInput > -5) {
      numInput = -5;
    }

    // remove everything
    myChart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });

    
    // add new things

    myChart.data.push({
      datasets: [{
        label: 'Your Mood',
        backgroundColor: 'rgb(45, 122, 255)',
        borderColor: 'rgb(45, 122, 255)',
        data: moodRatingRange,
      },{
        label: 'Your Energy',
        backgroundColor: 'rgb(0, 255, 119)',
        borderColor: 'rgb(0, 255, 119)',
        data: energyRatingRange,
      }]
    });

    chart.data.labels.pop();
    chart.data.labels.push(journalDate.slice(numInput));

    console.log(dateRange);

    myChart.update();
  };
  
  
  //CHART.JS CONFIG 
  const config = {
    type: 'line',
      data: {
        labels: dateRange,
        datasets: [{
            label: 'Your Mood',
            backgroundColor: 'rgb(45, 122, 255)',
            borderColor: 'rgb(45, 122, 255)',
            data: moodRatingRange,
          },{
            label: 'Your Energy',
            backgroundColor: 'rgb(0, 255, 119)',
            borderColor: 'rgb(0, 255, 119)',
            data: energyRatingRange,
          }]
    },
    
    options: {
      responsive: true,
      scales: {
        y: 10,
        xAxes: [
          {
            type: 'time',
            distribution: 'series'
          },
        ]
      },
      tooltip: {
        callbacks: 
          {
          footer: footer,
          },
        
      }
    }
  };
  

  //RENDER CHART.JS
  let myChart = new Chart(
    document.getElementById('myChart'),
    config
  );

  $("#remove-days").click(function(){
    setRange(5);
  });
  
  $("#add-days").click(function(){
    setRange(-5);
  });
});
