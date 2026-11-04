// Static catalog generated from assets/3D for GitHub Pages and file previews.
const artworks = [
  {
    "name": "Amelie",
    "path": "assets/3D/Amelie/",
    "sources": [
      "source.jpg"
    ],
    "credit": "valentina_dnguy",
    "category": "commissions"
  },
  {
    "name": "Amelie-28",
    "path": "assets/3D/Amelie-28/",
    "sources": [
      "source.png"
    ],
    "credit": "valentina_dnguy",
    "category": "commissions"
  },
  {
    "name": "BetterCyanotypeSS",
    "path": "assets/3D/BetterCyanotypeSS/",
    "sources": [
      "source.jpg"
    ],
    "credit": "shirin404",
    "category": "mine"
  },
  {
    "name": "BlueOne",
    "path": "assets/3D/BlueOne/",
    "sources": [
      "source.png"
    ],
    "credit": "Matthias_Gerson",
    "category": "commissions"
  },
  {
    "name": "CasualTracy",
    "path": "assets/3D/CasualTracy/",
    "sources": [
      "source.jpg"
    ],
    "credit": "shirin404",
    "category": "mine"
  },
  {
    "name": "Centica",
    "path": "assets/3D/Centica/",
    "sources": [
      "source.png"
    ],
    "credit": "shirin404",
    "category": "mine"
  },
  {
    "name": "Gambler",
    "path": "assets/3D/Gambler/",
    "sources": [
      "source.jpg"
    ],
    "credit": "",
    "category": ""
  },
  {
    "name": "LianeClement",
    "path": "assets/3D/LianeClement/",
    "sources": [
      "source.png"
    ],
    "credit": "matthiussy",
    "category": "commissions"
  },
  {
    "name": "Shiroi",
    "path": "assets/3D/Shiroi/",
    "sources": [
      "source.png"
    ],
    "credit": "valentina_dnguy",
    "category": "commissions"
  },
  {
    "name": "Steampunk",
    "path": "assets/3D/Steampunk/",
    "sources": [
      "source1.jpg",
      "source2.jpg"
    ],
    "credit": "shirin404",
    "category": "mine"
  },
  {
    "name": "Tikisha",
    "path": "assets/3D/Tikisha/",
    "sources": [
      "source.png"
    ],
    "credit": "tikishanomore",
    "category": "commissions"
  },
  {
    "name": "Unknown",
    "path": "assets/3D/Unknown/",
    "sources": [
      "source.png"
    ],
    "credit": "shirin404",
    "category": "mine"
  },
  {
    "name": "Valentina2",
    "path": "assets/3D/Valentina2/",
    "sources": [
      "source.png"
    ],
    "credit": "valentina_dnguy",
    "category": "commissions"
  },
  {
    "name": "Wisteria",
    "path": "assets/3D/Wisteria/",
    "sources": [
      "source.jpg"
    ],
    "credit": "yy/许愿骨",
    "category": "commissions"
  }
];

const gallery = document.querySelector('.gallery');
const cards = gallery.querySelector('.gallery-cards');
const status = gallery.querySelector('#art-status');
const actions = gallery.querySelector('.gallery-actions');
const previous = gallery.querySelector('#previous-art');
const next = gallery.querySelector('#next-art');
const filters = [...gallery.querySelectorAll('[data-filter]')];
const details = gallery.querySelector('#art-details');
const detailsBody = details.querySelector('#art-details-body');
const source = gallery.querySelector('#art-source');

let visible = artworks;
let selected = 0;

function linkToOriginal(image) {
  const link = document.createElement('a');
  link.href = image.src;
  link.target = '_blank';
  link.rel = 'noopener';
  link.setAttribute('aria-label', image.alt + ' (opens in a new tab)');
  link.append(image);
  return link;
}

function renderArtwork() {
  const artwork = visible[selected];
  cards.replaceChildren();
  actions.hidden = !artwork;
  previous.disabled = next.disabled = visible.length < 2;
  status.textContent = artwork
    ? (selected + 1) + ' of ' + visible.length
    : 'No artworks match this filter.';
  if (!artwork) return;

  source.disabled = artwork.sources.length === 0;
  const positions = visible.length > 2 ? [-1, 1, 0] : visible.length === 2 ? [1, 0] : [0];
  for (const offset of positions) {
    const item = visible[(selected + offset + visible.length) % visible.length];
    const image = new Image();
    image.src = item.path + '3D.png';
    image.alt = offset === 0 ? '3D artwork of ' + item.name : '';
    const card = offset === 0 ? linkToOriginal(image) : image;
    card.className = offset === 0 ? 'art-current' : offset < 0 ? 'art-left' : 'art-right';
    cards.append(card);
  }
}

function moveArtwork(offset) {
  if (visible.length < 2) return;
  selected = (selected + offset + visible.length) % visible.length;
  renderArtwork();
}

function showDetails(title, ...content) {
  details.setAttribute('aria-label', title);
  detailsBody.replaceChildren(...content);
  details.showModal();
}

previous.addEventListener('click', () => moveArtwork(-1));
next.addEventListener('click', () => moveArtwork(1));

source.addEventListener('click', () => {
  const artwork = visible[selected];
  const images = artwork.sources.map((file, index) => {
    const image = new Image();
    image.src = artwork.path + encodeURIComponent(file);
    image.alt = artwork.name + ' source image ' + (index + 1);
    return linkToOriginal(image);
  });
  showDetails('Source', ...images);
});

gallery.querySelector('#art-designer').addEventListener('click', () => {
  const credit = document.createElement('p');
  credit.textContent = visible[selected].credit || 'No designer info';
  showDetails('Designer', credit);
});

for (const filter of filters) {
  filter.addEventListener('click', () => {
    for (const button of filters) {
      button.setAttribute('aria-pressed', String(button === filter));
    }
    visible = artworks.filter(artwork => filter.dataset.filter === 'all' || artwork.category === filter.dataset.filter);
    selected = 0;
    renderArtwork();
  });
}

renderArtwork();
