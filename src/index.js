const bgMusic = [
  {
    name: 'Cool Spot Rave Dance Tune',
    file: 'cool-spot-rave-dance-tune.mp3',
  },
  {
    name: 'Spinball Song 1',
    file: 'Spinball-Song-1.wav',
  },
  {
    name: 'Tunnel Scene (X)',
    file: 'tunnel-scene-x.mp3',
  },
  {
    name: 'Wii Sports Title',
    file: 'wii-sports-title.mp3',
  },
];

const SONG = 'song';
const CLIP = 'clip';

const sfx = [
  {
    name: 'Cool Spot Parade Tune',
    type: SONG,
    file: '08-parade-tune.mp3',
  },
  {
    name: 'Final Fantasy VII Victory',
    type: SONG,
    file: 'groju-ff7-victory-fanfare-hd.mp3',
  },
  {
    name: 'Mario Level Complete',
    type: SONG,
    file: 'mario-level-complete.mp3',
  },
  {
    name: 'Sonic Level Complete',
    type: SONG,
    file: 'sonic-3-music-level-complete.mp3',
  },
  {
    name: 'DMX - X Gon Give it to Ya',
    type: SONG,
    file: 'x-gon-give-it-to-ya.mp3',
  },
  {
    name: 'HOT TO GO',
    type: SONG,
    file: 'hot-to-go.mp3',
  },
  {
    name: 'Everybody Clap Your Hands',
    type: SONG,
    file: 'clap-your-hands.mp3',
  },
  {
    name: 'Drowning/ Panic (Sonic)',
    type: SONG,
    file: 'sonic-drowning.mp3',
  },
  {
    name: 'DMX "Yeah"',
    type: CLIP,
    file: 'dmx-yeah.mp3',
  },
  {
    name: 'Coin (Mario)',
    type: CLIP,
    file: 'mario-coin.mp3',
  },
  {
    name: 'Mushroom (Mario)',
    type: CLIP,
    file: 'mushroom-sound-effect.mp3',
  },
  {
    name: 'Taylor Tomlinson "You\'re Alright"',
    type: CLIP,
    file: 'youre-alright.mp3',
  },
  {
    name: 'Taylor Tomlinson "You\'re OK"',
    type: CLIP,
    file: 'youre-ok.mp3',
  },
  {
    name: 'Taylor Tomlinson "Walk it off, I love you"',
    type: CLIP,
    file: 'walk-it-off.mp3',
  },
  {
    name: 'Lil Jon "Yeah What Okay"',
    type: CLIP,
    file: 'yeah-what-okay-lil-jon.mp3',
  },
  {
    name: 'Nate Bargatze "GolLY"',
    type: CLIP,
    file: 'golly.mp3',
  },
  {
    name: 'BEEP',
    type: CLIP,
    file: 'beep.mp3',
  },
  {
    name: 'Buzzer',
    type: CLIP,
    file: 'buzzer.mp3',
  },
  {
    name: 'Cha-Ching',
    type: CLIP,
    file: 'cash-register.mp3',
  },
];

let bgMusicTimeout;

const buildFileSelector = (audioType, fileList) => {

  const musicTileParent = document.querySelector(`#${audioType}-tiles`);
  fileList.forEach(({ name, file, type = 'song' }) => {
    const div = document.createElement('div');
    div.classList.add(type);
    div.setAttribute('data-is-song', type === SONG);
    div.setAttribute('data-href', `./audio/${audioType}/${file}`);
    div.innerHTML = name;
    musicTileParent.appendChild(div);
  });
  const audioPlayer = document.querySelector(`audio#${audioType}`);
  musicTileParent.addEventListener('click', ({ target }) => {
    if (target.id != musicTileParent.id) {
      const file = target.getAttribute('data-href');
      const [_, name, ext] = file.split('.');
      audioPlayer.src = file;
      audioPlayer.type = `audio/${ext}`;
      audioPlayer.setAttribute('data-is-song', target.getAttribute('data-is-song'));
    }
  });
}

window.addEventListener('load', () => {
  buildFileSelector('bg-music', bgMusic);
  buildFileSelector('sfx', sfx);

  const bgMusicPlayer = document.querySelector(`audio#bg-music`);
  bgMusicPlayer.volume = 0.7;

  const sfxPlayer = document.querySelector(`audio#sfx`);

  sfxPlayer.addEventListener('play', () => {
    console.log(sfxPlayer.getAttribute('data-is-song'));
    if (sfxPlayer.getAttribute('data-is-song') == 'true') {
      bgMusicPlayer.pause();
    }
  });

  window.electron.send('getSettings');
  updateTime();
});

let settings = {
  teams: {
    left: {},
    right: {},
  },
};

let goals = {
  left: [],
  right: [],
};

window.electron.onSettingsChanged((newSettings) => {
  settings = newSettings;
  populateControls();
});

const populateControls = () => {
  document.querySelector('#period-length').value = formatTime(settings.periodLength).join('');
  document.querySelector('#intermission-length').value = formatTime(settings.intermissionLength).join('');
  document.querySelector('#total-periods').value = settings.totalPeriods;

  document.querySelector('#left-team-name').value = settings.teams.left.name;
  document.querySelector('#left-team-color').value = settings.teams.left.color;
  document.querySelector('#left-team-text').value = settings.teams.left.text;

  document.querySelector('#right-team-name').value = settings.teams.right.name;
  document.querySelector('#right-team-color').value = settings.teams.right.color;
  document.querySelector('#right-team-text').value = settings.teams.right.text;

  const leftTeamElement = document.querySelector('#left-team-players');
  leftTeamElement.innerHTML = '<span>Left Team <button onclick="addPlayer(event)">&plus;</button></span>';
  Object.values(settings.teams.left.players).forEach((player) => {
    createPlayerElement(player, 'left', leftTeamElement);
  });

  const rightTeamElement = document.querySelector('#right-team-players');
  rightTeamElement.innerHTML = '<span>Right Team <button onclick="addPlayer(event)">&plus;</button></span>';
  Object.values(settings.teams.right.players).forEach((player) => {
    createPlayerElement(player, 'right', rightTeamElement);
  });
};

const PLAY_CHAR = '&#x25BA;';
const PAUSE_CHAR = '&#x23F8;';

window.electron.onUpdate(() => {
  setTimeout(() => {
    document.querySelector('#left-score').value = state.teams.left.score;
    document.querySelector('#left-timeouts').value = state.teams.left.timeouts;
    document.querySelector('#right-score').value = state.teams.right.score;
    document.querySelector('#right-timeouts').value = state.teams.right.timeouts;
    document.querySelector('#period-edit').value = state.period;
    const ppBtn = document.querySelector('#play-pause');
    if (state.play) {
      ppBtn.style.background = '#fc0';
      ppBtn.style.color = '#000';
      ppBtn.innerHTML = PAUSE_CHAR;
    } else {
      ppBtn.style.background = '#090';
      ppBtn.style.color = '#fff';
      ppBtn.innerHTML = PLAY_CHAR;
    }
    updateGoalList();
  }, 10);
});

const updateTime = () => {
  const display = formatTime(state.time);
  const clockEdit = document.querySelector('#clock-edit');
  if (state.play || clockEdit.value == '') {
    clockEdit.value = display.join('');
    clockEdit.setAttribute('disabled', 'disabled');
  }
  else clockEdit.removeAttribute('disabled');
  window.requestAnimationFrame(updateTime);
};

const parseTime = (text) => {
  let value = state.time;
  try {
    if (text.includes('.')) {
      const [sec, tenths] = text.split('.').map(x => parseInt(x));
      value = (sec * SECONDS) + (tenths * SECONDS / 10);
    } else if (text.includes(':')) {
      const [min, sec] = text.split(':').map(x => parseInt(x));
      value = (min * MINUTES) + (sec * SECONDS);
    } else {
      value = parseInt(text) * MINUTES
    }
    if (isNaN(value)) throw Error(`${text} is not a valid time format`);
  } catch (ex) {
    console.error(ex);
  }
  return value;
};

const saveSettings = () => {
  const get = (id) => document.querySelector(`#${id}`).value;
  const newSettings = {
    periodLength: parseTime(get('period-length')),
    totalPeriods: parseFloat(get('total-periods')),
    intermissionLength: parseTime(get('intermission-length')),
    teams: {
      left: {
        name: get('left-team-name'),
        color: get('left-team-color'),
        text: get('left-team-text'),
        players: settings.teams.left.players,
      },
      right: {
        name: get('right-team-name'),
        color: get('right-team-color'),
        text: get('right-team-text'),
        players: settings.teams.right.players,
      },
    },
  };
  window.electron.send('updateSettings', newSettings);
};

const edit = (event) => {
  const { target } = event;
  const { value, checked } = target;
  const path = target.getAttribute('data-path');
  const type = target.getAttribute('data-type');

  let data;

  switch (type) {
    case 'time':
      data = parseTime(value);
      break;
    case 'float':
      data = parseFloat(value);
      break;
    case 'int':
      data = parseInt(value);
      break;
    case 'json':
      data = JSON.parse(value);
      break;
    case 'boolean':
      data = checked;
      break;
    default:
      data = value;
      break;
  }
  window.electron.send('updateState', { path, data });
}

const BTN = {
  LEFT_TEAM_PLUS_ONE: '7',
  LEFT_TEAM_MINUS_ONE: '4',
  LEFT_TEAM_TIMEOUT: '1',
  RIGHT_TEAM_PLUS_ONE: '8',
  RIGHT_TEAM_MINUS_ONE: '5',
  RIGHT_TEAM_TIMEOUT: '2',
  PLAY_PAUSE_CLOCK: '0',
  PLAY_PAUSE_BG_MUSIC: '/',
  HOTKEY_1: '*',
  HOTKEY_2: '9',
  HOTKEY_3: '6',
  HOTKEY_4: '3',
  HOTKEY_5: '.',
  HOTKEY_6: '-',
  HOTKEY_7: '+',
};

window.addEventListener('keypress', (event) => {
  const { key, code, target } = event;
  if (target.tagName.toUpperCase() == 'INPUT') return;

  let channel, path, data;
  switch (key) {
    case BTN.LEFT_TEAM_MINUS_ONE:
      channel = 'updateState'
      path = 'teams.left.score';
      data = state.teams.left.score - 1;
      break;
    case BTN.LEFT_TEAM_PLUS_ONE:
      channel = 'updateState'
      path = 'teams.left.score';
      data = state.teams.left.score + 1;
      break;
    case BTN.LEFT_TEAM_TIMEOUT:
      channel = 'timeout-left';
      break;
    case BTN.RIGHT_TEAM_MINUS_ONE:
      channel = 'updateState'
      path = 'teams.right.score';
      data = state.teams.right.score - 1;
      break;
    case BTN.RIGHT_TEAM_PLUS_ONE:
      channel = 'updateState'
      path = 'teams.right.score';
      data = state.teams.right.score + 1;
      break;
    case BTN.RIGHT_TEAM_TIMEOUT:
      channel = 'timeout-right';
      break;
    case BTN.PLAY_PAUSE_CLOCK:
      channel = 'toggle-clock';
      break;
    case BTN.PLAY_PAUSE_BG_MUSIC:
      const bgMusicPlayer = document.querySelector(`audio#bg-music`);
      if (bgMusicPlayer.paused && bgMusicPlayer.readyState == 4) bgMusicPlayer.play();
      else bgMusicPlayer.pause();
      break;
    case BTN.HOTKEY_1:
      hotkey(1);
      break;
    case BTN.HOTKEY_2:
      hotkey(2);
      break;
    case BTN.HOTKEY_3:
      hotkey(3);
      break;
    case BTN.HOTKEY_4:
      hotkey(4);
      break;
    case BTN.HOTKEY_5:
      hotkey(5);
      break;
    case BTN.HOTKEY_6:
      hotkey(6);
      break;
    case BTN.HOTKEY_7:
      hotkey(7);
      break;
  }
  if (channel) {
    window.electron.send(channel, { path, data });
  }
});

const toggleClock = () => {
  window.electron.send('toggle-clock');
}

const hotkey = (i) => {
  console.log(`hotkey pressed: ${i}`);
};

const handleClockEnd = () => {
  const sfxPlayer = document.querySelector(`audio#sfx`);
  sfxPlayer.src = './audio/sfx/buzzer.mp3';
  sfxPlayer.type = `audio/mp3`;
  sfxPlayer.setAttribute('data-is-song', false);
  setTimeout(() => sfxPlayer.play(), 0);
};

const addPlayer = (event) => {
  const { target } = event;
  const { parentElement: teamElement } = target.parentElement; // target is button, parent is span, so we want the parent above that
  const team = teamElement.getAttribute('data-team');
  const player = {
    id: generateId(),
    first: '',
    last: '',
    number: ''
  };
  settings.teams[team].players[player.id] = player;
  createPlayerElement(player, team, teamElement);
};

const createPlayerElement = (player, team, parent) => {
  const playerDiv = document.createElement('div');
  playerDiv.classList.add('player');
  playerDiv.setAttribute('id', player.id);
  playerDiv.innerHTML = `
    <input onblur="updatePlayerField(event, '${team}', '${player.id}', 'number')" type="text" placeholder="no." class="jersey-number" value="${player.number}"/>
    <input onblur="updatePlayerField(event, '${team}', '${player.id}', 'first')" type="text" placeholder="first name" class="first-name" value="${player.first}"/>
    <input onblur="updatePlayerField(event, '${team}', '${player.id}', 'last')" type="text" placeholder="last name" class="last-name" value="${player.last}"/>
    <button class="switch">switch</button>
    <button class="remove">&times;</button>
  `;
  parent.appendChild(playerDiv);
};

const otherTeam = {
  'right': 'left',
  'left': 'right',
};

const handleClick = (event) => {
  const { target } = event;
  if (target.tagName.toUpperCase() != 'BUTTON') return;

  const { parentElement: playerDiv } = target;
  const { id } = playerDiv;
  const { parentElement: teamElement } = playerDiv;
  const team = teamElement.getAttribute('data-team');
  const oppositeTeam = otherTeam[team];
  const otherTeamElement = document.querySelector(`#${oppositeTeam}-team-players`);

  if (target.classList.contains('switch')) {
    settings.teams[oppositeTeam].players[id] = settings.teams[team].players[id];
    delete settings.teams[team].players[id];
    teamElement.removeChild(playerDiv);
    otherTeamElement.appendChild(playerDiv);
  } else if (target.classList.contains('remove')) {
    delete settings.teams[team].players[id];
    teamElement.removeChild(playerDiv);
  }
};

const updatePlayerField = (event, team, id, field) => {
  const { value } = event.target;
  settings.teams[team].players[id][field] = value;
  console.log(settings.teams);
};

const updateGoalList = () => {


  ['left', 'right'].forEach(t => {
    const team = state.teams[t];
    const teamGoals = goals[t];
    const teamGoalsDiv = document.querySelector(`#${t}-team-goals`);

    if (team.score < teamGoals.length) {
      // we've taken away at least one goal, so just truncate the list
      goals[t] = teamGoals.slice(0, team.score);
      const goalDivs = teamGoalsDiv.querySelectorAll('.goal');
      goalDivs.forEach((goalDiv, i) => {
        if (i < team.score) return;
        teamGoalsDiv.removeChild(goalDiv);
      });
    }
    // otherwise, we've got goals to add
    while (team.score > teamGoals.length) {
      const goal = {
        id: generateId(),
        time: state.time,
        period: state.period,
        scorer: null,
        assist: null,
      };

      const goalDiv = document.createElement('div');
      goalDiv.classList.add('goal');
      goalDiv.id = goal.id;
      teamGoals.push(goal);

      goalDiv.innerHTML = `
        <span>P${goal.period} ${formatTime(goal.time).join('')}</span>
        <select class="scorer" onblur="updateGoal(event, '${t}', '${goal.id}', 'scorer')">
        ${getPlayersAsOptions(settings.teams[t].players)}
        </select>
        <span>from</span>
        <select class="assist" onblur="updateGoal(event, '${t}', '${goal.id}', 'assist')">
        ${getPlayersAsOptions(settings.teams[t].players)}
        </select>
      `;
      teamGoalsDiv.appendChild(goalDiv);
    }
  });
};

const getPlayersAsOptions = (players) => [
  {
    id: '0',
    number: '',
    first: '---',
    last: '',
  },
  ...Object.values(players),
].map(p => `
  <option value="${p.id}">${p.number} ${p.first} ${p.last}</option>
`);

const updateGoal = (event, team, id, field) => {
  const { value } = event.target;
  const goal = goals[team].find(g => g.id == id);
  if (!goal) console.error(`Cannot find goal ${id}`);
  goal[field] = value;
};

const idCharacters = new Array(16).fill(0).map((_, i) => i.toString(16));
console.log(idCharacters.join(''));
const generateId = (length = 8) => new Array(length).fill(0).map(() => idCharacters[Math.floor(Math.random() * idCharacters.length)]).join('');