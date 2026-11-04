const termDialog = document.querySelector('.term-dialog');

document.addEventListener('click', event => {
  const term = event.target.closest('.technical-term > button');
  if (!term) return;

  const definition = document.getElementById(term.getAttribute('aria-describedby'));
  termDialog.querySelector('#term-title').textContent = term.textContent;
  termDialog.querySelector('#term-description').textContent = definition.textContent;
  termDialog.showModal();
});
