(() => {
  const trigger = document.querySelector('#unlock-mod-loader');
  const dialog = document.querySelector('#mod-loader-dialog');
  const form = document.querySelector('#mod-loader-password-form');
  const password = document.querySelector('#mod-loader-password');
  const status = document.querySelector('#mod-loader-status');
  const frame = document.querySelector('#mod-loader-content');
  const submit = form.querySelector('[type="submit"]');

  trigger.addEventListener('click', () => {
    form.reset();
    status.textContent = '';
    dialog.showModal();
  });

  document.querySelector('#cancel-mod-loader').addEventListener('click', () => dialog.close());
  dialog.addEventListener('cancel', event => {
    if (submit.disabled) event.preventDefault();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const enteredPassword = password.value;
    password.value = '';
    await unlock(enteredPassword);
  });

  async function unlock(enteredPassword, fromLink = false) {
    if (submit.disabled) return;
    submit.disabled = true;
    trigger.disabled = true;
    if (fromLink) {
      document.querySelector('#technical-tab').click();
      for (let section = trigger.closest('details'); section; section = section.parentElement.closest('details')) {
        section.open = true;
      }
    }
    form.querySelector('#cancel-mod-loader').disabled = true;
    status.textContent = 'Unlocking…';
    let reader;
    try {
      const response = await fetch('assets/code/ModLoader.zip');
      if (!response.ok || !window.zip) throw new Error('Archive or ZIP reader unavailable');
      reader = new zip.ZipReader(new zip.Uint8ArrayReader(new Uint8Array(await response.arrayBuffer())));
      const entries = await reader.getEntries();
      const entry = entries.find(item => item.filename === 'mod-loader.html' && item.encrypted);
      if (!entry) throw new Error('Missing encrypted HTML entry');

      let html;
      try {
        html = await entry.getData(new zip.TextWriter(), {
          password: enteredPassword,
          checkSignature: true,
          useWebWorkers: false,
        });
      } catch {
        status.textContent = 'Could not decrypt the file. Check the password and try again.';
        if (!dialog.open) dialog.showModal();
        password.focus();
        return;
      }

      frame.srcdoc = html;
      frame.hidden = false;
      if (dialog.open) dialog.close();
      trigger.hidden = true;
      if (fromLink) frame.scrollIntoView({ block: 'nearest' });
      frame.focus();
    } catch {
      if (!dialog.open) dialog.showModal();
      status.textContent = 'Could not load the protected details. Open the site over HTTP or HTTPS and try again.';
    } finally {
      submit.disabled = false;
      trigger.disabled = false;
      form.querySelector('#cancel-mod-loader').disabled = false;
      if (reader) await reader.close();
    }
  }

  const fragment = new URLSearchParams(window.location.hash.slice(1));
  if (fragment.has('key')) {
    const key = fragment.get('key');
    fragment.delete('key');
    const url = new URL(window.location.href);
    url.hash = fragment.toString();
    window.history.replaceState(window.history.state, '', url);
    if (key) unlock(key, true);
  }
})();
