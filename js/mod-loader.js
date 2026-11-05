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
    if (submit.disabled) return;
    submit.disabled = true;
    form.querySelector('#cancel-mod-loader').disabled = true;
    status.textContent = 'Unlocking…';
    const enteredPassword = password.value;
    password.value = '';

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
        password.focus();
        return;
      }

      frame.srcdoc = html;
      frame.hidden = false;
      dialog.close();
      frame.focus();
      trigger.hidden = true;
    } catch {
      status.textContent = 'Could not load the protected details. Open the site over HTTP or HTTPS and try again.';
    } finally {
      if (reader) await reader.close();
      submit.disabled = false;
      form.querySelector('#cancel-mod-loader').disabled = false;
    }
  });
})();
