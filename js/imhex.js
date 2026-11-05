(() => {
  const tokens = /(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<directive>#[a-z]+)|(?<number>\b(?:0x[\da-f]+|0b[01]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b)/gi;
  const words = /(?<keyword>\b(?:struct|union|enum|bitfield|using|namespace|fn|if|else|while|for|return|break|continue|match|true|false|le|be)\b)|(?<type>\b(?:[us](?:8|16|24|32|48|64|96|128)|float|double|bool|char|char16|str|padding|auto|void)\b)|(?<operator>@|::|\[\[|\]\]|\$)|\b[a-z_]\w*\b/gi;
  const imhex = new RegExp(tokens.source + '|' + words.source, 'gi');
  const python = /(?<comment>#[^\n]*)|(?<string>(?:"""[\s\S]*?"""|\x27\x27\x27[\s\S]*?\x27\x27\x27|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|(?<keyword>\b(?:False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b)|(?<type>\b(?:bool|bytes|dict|float|int|list|object|set|str|tuple)\b)|(?<number>\b(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?[\d_]+)?)\b)|\b[a-zA-Z_]\w*\b/g;

  function highlightCode(container) {
    for (const code of container.querySelectorAll('code.language-imhex, code.language-python')) {
      const pattern = code.classList.contains('language-python') ? python : imhex;
      const source = code.textContent;
      const highlighted = document.createDocumentFragment();
      let end = 0;

      for (const match of source.matchAll(pattern)) {
        highlighted.append(source.slice(end, match.index));
        const kind = Object.keys(match.groups).find(key => match.groups[key] !== undefined);
        if (kind) {
          const span = document.createElement('span');
          span.className = 'imhex-' + kind;
          span.textContent = match[0];
          highlighted.append(span);
        } else {
          highlighted.append(match[0]);
        }
        end = match.index + match[0].length;
      }

      highlighted.append(source.slice(end));
      code.replaceChildren(highlighted);
    }
  }

  highlightCode(document);

  const dialog = document.querySelector('.code-dialog');
  const content = dialog.querySelector('.code-dialog-content');

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-code]');
    if (!trigger) return;

    const template = document.getElementById(trigger.dataset.code);
    dialog.querySelector('#code-title').textContent = template.dataset.title;
    content.replaceChildren(template.content.cloneNode(true));
    highlightCode(content);
    dialog.showModal();
  });
})();
