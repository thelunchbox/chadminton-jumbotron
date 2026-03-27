// ------------- scoreboard operation

const fs = require('fs');
const path = require('path');
const settingsFilepath = path.resolve(__dirname, 'settings.json');

const MINUTES = 60 * 1000;
const SECONDS = 1000;

// default settings
let settings = {
  periodLength: 20 * MINUTES,
  totalPeriods: 2,
  intermissionLength: 5 * MINUTES,
  teams: {
    left: {
      name: 'RED',
      color: '#f12',
      text: '#fff',
      players: {},
    },
    right: {
      name: 'BLUE',
      color: '#15f',
      text: '#fff',
      players: {},
    },
  },
};

// default state
let state;
let prevState = {};

let childWindows;

const setup = (windows) => {
  childWindows = windows;

  let savedSettings = {};
  try {
    const contents = fs.readFileSync(settingsFilepath, 'utf8');
    savedSettings = JSON.parse(contents);
  } catch (ex) {
    console.log('No saved settings found, using default settings.');
    savedSettings = {
      teams: {
        left: {},
        right: {},
      },
    };
  }

  settings = {
    ...settings,
    ...savedSettings,
    teams: {
      left: {
        ...(settings.teams.left),
        ...(savedSettings?.teams.left || {}),
      },
      right: {
        ...(settings.teams.right),
        ...(savedSettings?.teams.right || {}),
      },
    },
  };

  state = {
    time: settings.periodLength,
    last: null,
    play: false,
    period: 1,
    message: 'Period 1',
    teams: {
      left: {
        ...settings.teams.left,
        score: 0,
        timeouts: 2,
      },
      right: {
        ...settings.teams.right,
        score: 0,
        timeouts: 2,
      },
    },
  };

  setTimeout(tick, 33);
};

const isObject = (x) => typeof x === 'object' && !Array.isArray(x) && x !== null;

const getChangedProperties = (prev, next) => {  
  const prevSafe = (prev || {});
  const oldKeys = Object.keys(prevSafe);
  const newKeys = Object.keys(next || {});
  const diff = newKeys.reduce((obj, key) => {
    const obj1 = { ...obj };
    if (prevSafe[key] != next[key]) {
      if (isObject(next[key])) {
        obj1[key] = getChangedProperties(prevSafe[key], next[key]);
      } else {
        obj1[key] = next[key];
      }
    }
    return obj1;
  }, {});
  return diff;
}

const sendUpdate = (data = null) => {
  const payload = data || state;
  if (Object.keys(payload).length == 0) return;
  childWindows.forEach(win => {
    win.webContents.send('update', payload);
  });
}

const toggleClock = (override = null) => {
  state.play = override != null ? override : !state.play;
  state.last = state.play ? new Date() : null;
  sendFullState();
};

const formatTime = (time) => {
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
};

const tick = () => {
  if (state.period <= settings.totalPeriods) {
    if (state.play) {
      const now = new Date();
      const difference = now.getTime() - state.last.getTime();
      state.last = now;
      state.time -= difference;

      if (state.time <= 0) {
        state.time = 0;
        toggleClock(false);
        clockStateChange();
      }
    }
  }
  setTimeout(tick, 33);
};

const clockStateChange = (override = null) => {
  toggleClock(false);
  if (override != null) {
    state.period = override;
  } else if (state.period >= settings.totalPeriods) {
      state.period += 1;
  } else {
    // we always add a half a period here
    state.period += 0.5;
    const displayPeriod = Math.floor(state.period);
    if (state.period == displayPeriod) {
      state.time = settings.periodLength;
    } else if (displayPeriod < settings.totalPeriods) {
      state.time = settings.intermissionLength;
      // start the clock for the intermission break
      // (after a small delay)
      setTimeout(() => toggleClock(true), 3 * SECONDS);
    }
  }
  setPeriodMessage();
  sendFullState();
};

const setPeriodMessage = (message = null) => {
  // set period message
  if (message) {
    state.message = message;
    return;
  }
  if (state.period > settings.totalPeriods) {
    if (state.teams.left.score === state.teams.right.score) {
      state.message = 'OVERTIME';
    } else {
      state.message = 'GAME OVER';
    }
  } else {
    const displayPeriod = Math.floor(state.period);
    if (state.period == displayPeriod) {
      // if this is true, we're actually inside a period of play
      state.message = `Period ${displayPeriod}`;
    } else if (displayPeriod < settings.totalPeriods) {
      // otherwise we're either in an intermission or pregame
      state.message = `INTERMISSION ${displayPeriod}`;
    }
  }
};

const sendFullState = () => {
  sendUpdate(state);
};

const sendSettings = () => {
  childWindows.forEach(win => {
    win.webContents.send('settingsChanged', settings);
  });
}

const saveSettings = () => {
  fs.writeFileSync(settingsFilepath, JSON.stringify(settings));
};

const updateState = ({ path, data }) => {
  console.log(path, data);
  let target = state;
  const pathArray = path.split('.');
  let hop;
  while (pathArray.length > 1) {
    const hop = pathArray.shift();
    target = target[hop];
  }
  const [ key ] = pathArray;
  target[key] = data;
  sendFullState();
};

const updateSettings = (newSettings) => {
  settings = newSettings;
  sendSettings();
  state = {
    ...state,
    teams: {
      left: {
        ...state.teams.left,
        ...newSettings.teams.left,
      },
      right: {
        ...state.teams.right,
        ...newSettings.teams.right,
      },
    },
  };
  sendFullState();
};

const timeout = (team) => {
  if (state.teams[team].timeouts > 0) {
    toggleClock(false);
    state.teams[team].timeouts -= 1;
    sendFullState();
  }
};

module.exports = {
  saveSettings,
  sendFullState,
  sendSettings,
  setup,
  timeout,
  toggleClock,
  updateSettings,
  updateState,
};