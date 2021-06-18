

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