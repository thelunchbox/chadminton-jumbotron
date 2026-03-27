let state = {
  time: 0,
  last: null,
  teams: {
    left: {},
    right: {},
  },
};

const MINUTES = 60 * 1000;
const SECONDS = 1000;

window.addEventListener('load', () => {
  window.electron.send('getFullState');
  tick();
});

window.electron.onUpdate((newState) => {
  state = newState;
  console.log(state);
  updateScoreboard();
  setClockDisplay();
});

function updateScoreboard() {
  const teamPairs = [
    [document.querySelector('#left'), state.teams.left],
    [document.querySelector('#right'), state.teams.right],
  ];
  teamPairs.forEach(([element, team]) => {
    element.querySelector('.name').innerHTML = team.name;
    element.querySelector('.score').innerHTML = team.score;
    element.querySelector('.timeouts').innerHTML = new Array(team.timeouts).fill('.').join(' ');
    element.style.background = team.color;
    element.style.color = team.text;
  });
}

function formatTime(time) {
  let display = ['', '', ''];
  const min = Math.floor(time / MINUTES);
  const sec = Math.floor((time % MINUTES) / SECONDS);
  const tenths = Math.floor((time % SECONDS) / 100);
  if (min == 0) {
    display = [sec.toString(), '.', tenths];
  } else {
    display = [min.toString(), ':', sec.toString().padStart(2, '0')];
  }
  return display;
}

const setClockDisplay = () => {
  let display = formatTime(state.time);
  const clock = document.querySelector('#middle .clock');
  if (display[1] === '.') {
    clock.classList.add('seconds');
  } else {
    clock.classList.remove('seconds');
  }

  clock.querySelector('.high').innerHTML = display[0];
  clock.querySelector('.separator').innerHTML = display[1];
  if (display[0] >= 20 && display[1] == ':') {
    clock.querySelector('.separator').style.opacity = '0';
  } else {
    clock.querySelector('.separator').style.opacity = '1';
  }
  clock.querySelector('.low').innerHTML = display[2];

  if (state.play) {
    clock.classList.remove('stopped');
  } else {
    clock.classList.add('stopped');
  }
  document.querySelector('#middle .period').innerHTML = state.message;
  window.requestAnimationFrame(setClockDisplay);
};

const tick = () => {
  if (state.play) {
    const now = new Date();
    const difference = now.getTime() - state.last.getTime();
    state.last = now;
    state.time -= difference;

    if (state.time <= 0) {
      state.time = 0;
      if (handleClockEnd) handleClockEnd();
    }
  }
  setTimeout(tick, 33);
};