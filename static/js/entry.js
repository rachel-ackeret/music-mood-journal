

//Quill Editor CONFIG
var quill = new Quill('#editor-container', {
    modules: {
      toolbar: true
    },
    theme: 'snow'
  });

// RENDER QUILL
var form = document.querySelector('form');
  form.onsubmit = function() {
  // Populate hidden form on submit
  var journalEntry = document.querySelector('input[name=journal_entry]');
  journalEntry.value = quill.root.innerHTML;
}


const moodRange = document.querySelector('#mood');
const energyRange = document.querySelector('#energy');

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

moodRange.addEventListener('input', (e) => {
  let rangeValue = e.target.value;
  $("#emoji").attr("src", mojis[rangeValue - 1]);
});

energyRange.addEventListener('input', (e) => {
  let energyValue = e.target.value;
  $("#energy-icon").attr("src", energies[energyValue - 1]);
});