const tabList = document.querySelector('[role="tablist"]');
const tabs = [...tabList.querySelectorAll('[role="tab"]')];
const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
const scrollPositions = tabs.map(() => ({ top: 0, left: 0 }));
let activeIndex = 0;

function activateTab(index) {
  if (index === activeIndex) return;

  scrollPositions[activeIndex] = {
    top: window.scrollY,
    left: window.scrollX,
  };
  tabs[activeIndex].setAttribute('aria-selected', 'false');
  tabs[activeIndex].tabIndex = -1;
  panels[activeIndex].hidden = true;

  activeIndex = index;
  tabs[index].setAttribute('aria-selected', 'true');
  tabs[index].tabIndex = 0;
  panels[index].hidden = false;
  window.scrollTo(scrollPositions[index]);
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(index));

  tab.addEventListener('keydown', event => {
    let nextIndex;

    switch (event.key) {
      case 'ArrowLeft':
        nextIndex = (index - 1 + tabs.length) % tabs.length;
        break;
      case 'ArrowRight':
        nextIndex = (index + 1) % tabs.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    activateTab(nextIndex);
    tabs[nextIndex].focus({ preventScroll: true });
  });
});
