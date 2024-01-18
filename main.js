// will define the time we want for the timer
let timer = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    session: 0,
    remainingTime: {
        total: 25 * 60, // Initial value for pomodoro
        minutes: 25,
        seconds: 0,
    },
    mode: 'pomodoro', // Added mode property
};
const fehBody = document.body
const workDurationInput = document.getElementById('work-duration');
const restDurationInput = document.getElementById('rest-duration');
const timerTime = document.getElementById('feh-timer-time');
const circleProgress = document.querySelector('.circle-progress');


let workDuration = parseInt(workDurationInput.value) * 60;
let restDuration = parseInt(restDurationInput.value) * 60;
let remainingTime = workDuration;


const btnToggleSettings = document.getElementById('feh-toggle-settings');
const btnCloseSettings = document.getElementById('feh-close-settings');

function setBodySettings(){
    fehBody.classList.contains('settings-active') ? fehBody.classList.remove('settings-active') : fehBody.classList.add('settings-active');
}

function toggleSettings(){
    if(event.type === 'click'){
        setBodySettings();
    }
    else if((event.type === 'keydown' && event.keyCode === 27)) {
        fehBody.classList.remove('settings-active');
    }
}

btnToggleSettings.addEventListener('click',toggleSettings);
btnCloseSettings.addEventListener('click',toggleSettings);
document.addEventListener('keydown',toggleSettings);

// work / rest settings
workDurationInput.addEventListener('change', () => {
    workDuration = parseInt(workDurationInput.value) * 60;
    remainingTime = workDuration;
    updateClock();
});

restDurationInput.addEventListener('change', () => {
    restDuration = parseInt(restDurationInput.value) * 60;
    remainingTime = restDuration;
    updateClock();
});

// workDurationInput.addEventListener('change', () => {
//     const newWorkDuration = parseInt(workDurationInput.value) * 60;
//     timer.pomodoro = newWorkDuration / 60; // Convert back to minutes
//     timer.remainingTime = {
//         total: newWorkDuration,
//         minutes: timer.pomodoro,
//         seconds: 0,
//     };
//     updateClock();
// });

// restDurationInput.addEventListener('change', () => {
//     const newRestDuration = parseInt(restDurationInput.value) * 60;
//     timer.shortBreak = newRestDuration / 60; // Convert back to minutes
//     timer.remainingTime = {
//         total: newRestDuration,
//         minutes: timer.shortBreak,
//         seconds: 0,
//     };
//     updateClock();
// });


// 


// circle variables
const semicircles = document.querySelectorAll('.semicircle');


let interval;

const buttonSound = new Audio('button-sound.mp3');
const mainButton = document.getElementById('js-btn');
mainButton.addEventListener('click',() => {
    buttonSound.play();
    const { action } = mainButton.dataset;
    if (action === 'start') {
        startTimer();
    }
    else {
        stopTimer();
    }
});

// create listener which will listen for whenever the buttons are clicked
const modeButtons = document.querySelector('#js-mode-buttons');
modeButtons.addEventListener('click', handleMode);

function handleMode(event) {
  const { mode } = event.target.dataset;

  if (!mode) return;

  switchMode(mode);
  stopTimer();
}
function switchMode(mode){
    timer.mode = mode;
    timer.remainingTime = {
        total: timer[mode] * 60,
        minutes: timer[mode],
        seconds: 0,
    };
    document.querySelectorAll('button[data-mode]').forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.body.style.backgroundColor = `var(--${mode})`;
    document.getElementById('js-progress').setAttribute('max',timer.remainingTime.total);

    updateClock();
}

function getRemainingTime(endTime) {
  const currentTime = Date.parse(new Date());
  const difference = endTime - currentTime;

  const total = Number.parseInt(difference / 1000, 10);
  const minutes = Number.parseInt((total / 60) % 60, 10);
  const seconds = Number.parseInt(total % 60, 10);

  return {
    total,
    minutes,
    seconds,
  };
}
function startTimer(){
    let { total } = timer.remainingTime;
    const endTime = Date.parse(new Date()) + total * 1000;

    if(timer.mode === 'pomodoro') timer.session++; //increments the sessions count at the start of each pomodoro session

    mainButton.dataset.action = 'stop';
    mainButton.textContent = 'stop';
    mainButton.classList.add('active');

    interval = setInterval(function(){
        timer.remainingTime = getRemainingTime(endTime);
        updateClock();

        total = timer.remainingTime.total;
        if (total <= 0){
            clearInterval(interval);

            switch (timer.mode) { //depending on the value of timer.mode we will either go on a long brea or short break
                case 'pomodoro':
                    if(timer.sessions % timer.longBreakInterval === 0){
                        switchMode('longBreak');
                    } else {
                        switchMode('shortBreak');
                    }
                    break;
                default:
                //The default case is executed if a break session is ending which causes a new pomodoro session to begin.
                    switchMode('pomodoro');
            }
            if (Notification.permission === 'granted'){
                const text = timer.mode === 'pomodoro' ? 'Keep working!' : 'Take a break!';
                new Notification(text);
            }
            document.querySelector(`[data-sound="${timer.mode}"]`).play(); 
            startTimer();
        }
    }, 1000);
}
function stopTimer(){
    clearInterval(interval);
    
    mainButton.dataset.action = 'start';
    mainButton.textContent = 'start';
    mainButton.classList.remove('active');
}

function updateClock(){
    const { remainingTime } = timer;
    const minutes = `${remainingTime.minutes}`.padStart(2,'0');
    const seconds = `${remainingTime.seconds}`.padStart(2,'0');    

    const min = document.getElementById('js-minutes');
    const sec = document.getElementById('js-seconds');

    min.textContent = minutes;
    sec.textContent = seconds;

    const text = timer.mode == 'pomodoro' ? 'Get back to work!' : 'Take a break!'; //ternary operator, condition ? expression to execute if truth : expression to execute if false
    document.title = `${minutes}:${seconds} - ${text}`;
// in charge of updating the progress bar upper part of page
    const progress = document.getElementById('js-progress');
    progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
// initial progress bar ^^


// circular progress bar 
    // Calculate the angle based on the remaining time
    const angle = (remainingTime.total / (timer[timer.mode] * 60)) * 360;

    // Update the rotation of semicircles
    if (angle > 180){
        semicircles[2].style.display = 'none';
        semicircles[0].style.transform = 'rotate(180deg)';
        semicircles[1].style.transform = `rotate(${angle}deg)`;
    } else {
        semicircles[2].style.display = 'block';
        semicircles[0].style.transform = `rotate(${angle}deg)`;
        semicircles[1].style.transform = `rotate(${angle}deg)`;
    }
}

document.addEventListener('DOMContentLoaded',() =>{
    //Checks if browser supports notifications
    if('Notification' in window){
        // If notifications are allowed but permission to give notifications has NOT been allowed, ask for permission
        if(Notification.permission !== 'granted' && Notification.permission !== 'denied'){
            //ask user for permission
            Notification.requestPermission().then(function(permission){
                // if permission granted
                if(permission === 'granted'){
                    //create new notification
                    new Notification(
                        `I'll let you know when your next session begins!`
                    );
                }
            });
        }
    }
    switchMode('pomodoro');
});
