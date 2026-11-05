(() => {
  const buttons = [...document.querySelectorAll('[data-language]')];
  const status = document.querySelector('#language-status');
  const textSlots = document.querySelectorAll('[data-copy]');
  const labelSlots = document.querySelectorAll('[data-copy-aria-label], [data-copy-title]:not(template)');
  const catalogs = new Map();
  let activeCopy = new Map();
  let requestNumber = 0;

  window.portfolioText = (key, fallback) => activeCopy.get(key) ?? fallback;

  async function loadCopy(language) {
    if (catalogs.has(language)) return catalogs.get(language);

    const response = await fetch(language + '.html');
    if (!response.ok) throw new Error('Could not load language content');

    const documentFragment = new DOMParser().parseFromString(await response.text(), 'text/html');
    const template = documentFragment.querySelector('template[lang="' + language + '"]');
    const copy = new Map([...template.content.querySelectorAll('[data-copy]')]
      .map(entry => [entry.dataset.copy, entry.textContent]));

    catalogs.set(language, copy);
    return copy;
  }

  async function setLanguage(language) {
    const request = ++requestNumber;
    status.textContent = '';

    try {
      const copy = await loadCopy(language);
      if (request !== requestNumber) return;

      activeCopy = copy;
      document.documentElement.lang = language;
      for (const element of textSlots) {
        if (copy.has(element.dataset.copy)) element.textContent = copy.get(element.dataset.copy);
      }
      for (const element of labelSlots) {
        for (const attribute of ['aria-label', 'title']) {
          const key = element.getAttribute('data-copy-' + attribute);
          if (copy.has(key)) element.setAttribute(attribute, copy.get(key));
        }
      }
      for (const button of buttons) {
        button.setAttribute('aria-pressed', String(button.dataset.language === language));
      }
      document.dispatchEvent(new Event('portfolio-language-change'));
    } catch {
      if (request === requestNumber && language !== document.documentElement.lang) {
        status.textContent = 'Dil yüklenemedi. / Could not load the language.';
      }
    }
  }

  for (const button of buttons) {
    button.addEventListener('click', () => setLanguage(button.dataset.language));
  }
  setLanguage('en');
})();
