(() => {
  const trigger = document.querySelector('#unlock-mod-loader');
  const identityTrigger = document.querySelector('#unlock-identity');
  const identityPrompt = document.querySelector('#identity-prompt');
  const identity = document.querySelector('#protected-identity');
  const dialog = document.querySelector('#mod-loader-dialog');
  const form = document.querySelector('#mod-loader-password-form');
  const password = document.querySelector('#mod-loader-password');
  const status = document.querySelector('#mod-loader-status');
  const frame = document.querySelector('#mod-loader-content');
  const submit = form.querySelector('[type="submit"]');

  let unlockedName;
  let unlockedDetails;

  function renderDetails() {
    if (!unlockedDetails) return;
    frame.srcdoc = unlockedDetails[document.documentElement.lang] ?? unlockedDetails.en;
    frame.hidden = false;
  }

  function renderIdentity() {
    if (!unlockedName) return;
    identity.textContent = document.documentElement.lang === 'tr'
      ? 'Ben ' + unlockedName + '. ' : "I'm " + unlockedName + ". ";
  }

  document.addEventListener('portfolio-language-change', () => {
    renderIdentity();
    renderDetails();
  });

  function openPasswordDialog() {
    form.reset();
    status.textContent = '';
    dialog.showModal();
  }

  trigger.addEventListener('click', openPasswordDialog);
  identityTrigger.addEventListener('click', openPasswordDialog);

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
    identityTrigger.disabled = true;
    status.textContent = window.portfolioText('unlocking', 'Unlocking…');
    let reader;
    try {
      const response = await fetch('assets/info.zip?v=921d80510559');
      if (!response.ok || !window.zip) throw new Error('Archive or ZIP reader unavailable');
      reader = new zip.ZipReader(new zip.Uint8ArrayReader(new Uint8Array(await response.arrayBuffer())));
      const entries = await reader.getEntries();
      const englishEntry = entries.find(item => item.filename === 'mod-loader.en.html' && item.encrypted);
      const turkishEntry = entries.find(item => item.filename === 'mod-loader.tr.html' && item.encrypted);
      const nameEntry = entries.find(item => item.filename === 'identity.txt' && item.encrypted);
      if (!englishEntry || !turkishEntry || !nameEntry) throw new Error('Missing encrypted archive entry');

      let english;
      let turkish;
      let name;
      try {
        const options = {
          password: enteredPassword,
          checkSignature: true,
          useWebWorkers: false,
        };
        english = await englishEntry.getData(new zip.TextWriter(), options);
        turkish = await turkishEntry.getData(new zip.TextWriter(), options);
        name = await nameEntry.getData(new zip.TextWriter(), options);
      } catch {
        status.textContent = window.portfolioText('could-not-decrypt-the-file-check', 'Could not decrypt the file. Check the password and try again.');
        if (!dialog.open) dialog.showModal();
        password.focus();
        return;
      }

      unlockedDetails = { en: english, tr: turkish };
      renderDetails();
      unlockedName = name.trim();
      renderIdentity();
      if (dialog.open) dialog.close();
      identityPrompt.hidden = true;
      trigger.hidden = true;
      if (fromLink) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } else if (frame.getClientRects().length) {
        frame.focus({ preventScroll: true });
      } else {
        document.querySelector('[aria-describedby=nickname-definition]').focus({ preventScroll: true });
      }
    } catch {
      if (!dialog.open) dialog.showModal();
      status.textContent = window.portfolioText('could-not-load-the-protected-details', 'Could not load the protected details. Open the site over HTTP or HTTPS and try again.');
    } finally {
      submit.disabled = false;
      trigger.disabled = false;
      identityTrigger.disabled = false;
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
    if (key) {
      window.history.scrollRestoration = 'manual';
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      unlock(key, true);
    }
  }
})();
