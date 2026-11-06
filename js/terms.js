const termDialog = document.querySelector('.term-dialog');

document.addEventListener('click', event => {
  const term = event.target.closest('.technical-term > button');
  if (!term || term.id === 'unlock-identity') return;

  const definition = document.getElementById(term.getAttribute('aria-describedby'));
  termDialog.querySelector('#term-title').textContent = term.textContent;
  termDialog.querySelector('#term-description').textContent = definition.textContent;
  termDialog.showModal();
});

for (const dialog of document.querySelectorAll('dialog')) {
  let startedOnBackdrop = false;

  function isBackdrop(event) {
    if (event.target !== dialog) return false;
    const bounds = dialog.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX >= bounds.right
      || event.clientY < bounds.top || event.clientY >= bounds.bottom;
  }

  dialog.addEventListener('pointerdown', event => {
    startedOnBackdrop = isBackdrop(event);
  });

  dialog.addEventListener('click', event => {
    const clickedBackdrop = startedOnBackdrop && isBackdrop(event);
    startedOnBackdrop = false;
    if (!clickedBackdrop || !dialog.open) return;

    if (typeof dialog.requestClose === 'function') {
      dialog.requestClose();
    } else if (dialog.dispatchEvent(new Event('cancel', { cancelable: true }))) {
      dialog.close();
    }
  });
}
