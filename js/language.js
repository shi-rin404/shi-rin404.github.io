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

    const response = await fetch('lang/' + language + '.html');
    if (!response.ok) throw new Error('Could not load language content');

    const documentFragment = new DOMParser().parseFromString(await response.text(), 'text/html');
    const template = documentFragment.querySelector('template[lang="' + language + '"]');
    const copy = new Map([...template.content.querySelectorAll('[data-copy]')]
      .map(entry => [entry.dataset.copy, entry.textContent]));

    catalogs.set(language, copy);
    return copy;
  }

  function renderText(element, value, copy, slotIndex) {
    if (!value.includes('[[')) {
      element.textContent = value;
      return;
    }

    const parts = value.split(/\[\[(asset|binary|mesh|collider|quaternion|prefab|shader|register|ida|xxh32|leb128|little-endian|lod)(?:\|([^\]]+))?\]\]/);
    const content = document.createDocumentFragment();
    for (let index = 0; index < parts.length; index += 3) {
      content.append(parts[index]);
      const term = parts[index + 1];
      if (!term) break;

      const wrapper = document.createElement('span');
      wrapper.className = 'technical-term';
      const definition = document.createElement('span');
      definition.className = 'term-definition';
      definition.id = 'copy-term-' + slotIndex + '-' + index;
      definition.textContent = copy.get('term-' + term);
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = parts[index + 2] ?? term;
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-describedby', definition.id);
      wrapper.append(button, definition);
      content.append(wrapper);
    }
    element.replaceChildren(content);
  }

  async function setLanguage(language) {
    const request = ++requestNumber;
    status.textContent = '';

    try {
      const copy = await loadCopy(language);
      if (request !== requestNumber) return;

      activeCopy = copy;
      document.documentElement.lang = language;
      textSlots.forEach((element, index) => {
        if (copy.has(element.dataset.copy)) renderText(element, copy.get(element.dataset.copy), copy, index);
      });
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
