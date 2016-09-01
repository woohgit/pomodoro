counter = 0;

counterBack = 0;

workingPomodoro = 5;
shortBreak = 2;
longBreak = 3;

i = workingPomodoro;

selected_task = '';


coffeText = {image:'<i class="fa fa-coffee fa-5x" aria-hidden="true"></i>', text:"It's time for a coffee break!"};
workText  = {image:'<i class="fa fa-keyboard-o fa-5x" aria-hidden="true"></i>', text:"It's time to go back to work!"};
longbreakText = {image:'<i class="fa fa-coffee fa-5x" aria-hidden="true"></i>', text:"It's time for a long break!"};

coffeeButtonText = "Take a break!"
workButtonText = "Back to work!"

pomodoroConfig = [workingPomodoro, shortBreak, workingPomodoro, shortBreak, workingPomodoro, shortBreak, workingPomodoro, longBreak];
messageConfig = [workText, coffeText, workText, coffeText, workText, coffeText, workText, longbreakText, workText];
closeButtonText = [workButtonText, coffeeButtonText, workButtonText, coffeeButtonText, workButtonText, coffeeButtonText, workButtonText, coffeeButtonText, workButtonText];




pomodoroGlyph = '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';
externalInterrupt = '</span><span class="glyphicon glyphicon-minus" aria-hidden="true"></span>';
internalInterrupt = '</span><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>';


function loadTodo() {
  
  var data = null;
  
  try {
    data = JSON.parse(localStorage.getItem("todoData"));
  } catch(err) { }

  // an empty array is a valid data source for the the bootstap-table
  if ( data === null ) {
    data = [];
  }
  
  return data;
}

function formatSeconds(seconds) {
    m = parseInt(seconds / 60, 10);
    s = parseInt(seconds % 60, 10);

    m = m < 10 ? "0" + m : m;
    s = s < 10 ? "0" + s : s;

    return m + ":" + s;
}

function calculatePercent(seconds) {
    s = seconds / pomodoroConfig[counter-1] * 100;
    return s;
}

function startCounting() {
    
    if (counter >= 8) {
        counter = 0;
    }

    i = pomodoroConfig[counter];
    
    counter++;
    
    counterBack = setInterval(function () {
        i--;
        if (i >= 0) {
            $('.progress-bar').css('width', calculatePercent(i) + '%');
            $('#panel-footer').text(formatSeconds(i));
        } else {
            notifyMe('Times UP!', messageConfig[counter].text);
            clearInterval(counterBack);
            var modal = $('#myModal')
            modal.find('.modal-title').html(messageConfig[counter].image);
            modal.find('.modal-body').html(messageConfig[counter].text);
            // Every odd number is a pomodoro
            // don't let switching task before a break!
            // also increase pomodoros only when working not when having a break
            if ( counter % 2 > 0) {
              $("#switchTask").hide();
              increasePomodoro();
              loadTasks();
            } else {
              $("#switchTask").show();
            }
            $('#closeModal').text(closeButtonText[counter]);
            $('#myModal').modal({   
                keyboard: false
            });
        }
    }, 1000);

}

// request permission on page load
document.addEventListener('DOMContentLoaded', function () {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.'); 
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();
});

function audioNotification(){
    var alertSound = new Audio('demonstrative.mp3');
    alertSound.play();
}

function notifyMe(title, message) {

    try {
        settings = JSON.parse(localStorage.getItem("pomodoro_settings"));
        if (settings.notification == false) {
          return;
        }
    } catch(err) { 
      return;
    }
  
  
  if (Notification.permission !== "granted")
      Notification.requestPermission();
  else {
    audioNotification();
    var notification = new Notification(title, {
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Ic_timer_48px.svg/48px-Ic_timer_48px.svg.png',
      body: message,
    });

    notification.onclick = function () {
      window.open("http://stackoverflow.com/a/13328397/1269037");      
    };
  }
}

function loadTasks() {
  data = loadTodo();
  $('#table').bootstrapTable('load', data);
}

function populateTasks() {
  data = loadTodo();
  $('#table').bootstrapTable({
      columns: [{
           checkbox: true,
           formatter: stateFormatter
      }, { width: 400,
           field: 'task',
           title: 'Task name'
      }, { field: 'pomodoros',
           title: pomodoroGlyph + ' Pomodoros'
      }, {
           field: 'internal',
           title: internalInterrupt + ' Internal'
      },  {
           field: 'external',
           title: externalInterrupt + ' External'
      }],
      data: data
  });
}

function saveTasks(data) {
  localStorage.setItem("todoData", JSON.stringify(data));
}


function addNewTodoItem(name) {
  data = loadTodo();
  data.push({task: name, pomodoros: 0, external: 0, internal: 0, done: false});
  saveTasks(data);
  loadTasks();
}



function initializeSettings() {
  
  try {

    var lb = JSON.parse(localStorage.getItem("pomodoro_settings"));
    longBreak = lb;

  } catch(err) {

    longBreak = 25*60;

  }

}

$(document).ready(function(){

  initializeSettings();
  
  //localStorage.clear();
  populateTasks();
});

function cellStyle(value, row, index, field) {
  return {
    css: {"font-size": "10px"}
  };
}


function stateFormatter(value, row, index) {
  
    st = getSelectedTask();
    row.pomodoros = pomodoroGlyph.repeat(row.pomodoros);
    row.internal = internalInterrupt.repeat(row.internal);
    row.external = externalInterrupt.repeat(row.external);
    if (st != null) {
      if (row.task == st.task) {
        return {
            checked: true
        };
      }
    }
    if (row.done == true) {
      row.task = "<strike>" + row.task + "</strike>";
      return {
          checked: false
      }
    }
    return value;
}


function convertStringTimeToSeconds(text) {
  var a = text.split(':');
  var seconds = (+a[0]) * 60 + (+a[1]);
  return seconds;
}

function saveSettings(longBreak, notification) {
  
  seconds = convertStringTimeToSeconds(longBreak);
  data = {'long_break': seconds, 'notification': notification};
  localStorage.setItem("pomodoro_settings", JSON.stringify(data));
}

function saveSelectedTask(task) {
    localStorage.setItem("selected_task", JSON.stringify(task));
}

function getSelectedTask() {
    selected_task = null;
    try {
        selected_task = JSON.parse(localStorage.getItem("selected_task"));
    } catch (e) {}

    return selected_task;
}

function increasePomodoro() {
  
    st = getSelectedTask();
    task_name = st.task;
    
    data = loadTodo();
    for (var key in data) {
        if (data[key].task == task_name) {
            data[key].pomodoros += 1;
        }
            
    }
    saveTasks(data);
    loadTasks();

}

function removeSelected() {
  
    st = $('#table').bootstrapTable('getSelections');
    
    if (st.length == 0) {
      return;
    }

    task_name = st[0].task.replace(/(<([^>]+)>)/ig,"");

    data = loadTodo();
    var i = 0;
    for (var key in data) {
        if (data[key].task == task_name) {
          break;
        }
        i++;
    }
    data.splice(i, 1);
    saveTasks(data);
    loadTasks();

}

function markDoneSelected() {
    st = getSelectedTask();
    if (st == null) {

      st = $('#table').bootstrapTable('getSelections');

      if (st == '') {
        return;
      }    
      st = st[0];
    }

    task_name = st.task;
    
    data = loadTodo();
    var i = 0;
    for (var key in data) {
        if (data[key].task == task_name) {
          data[key].done = true;
        }
        i++;
    }
    saveTasks(data);
}

function isTaskDisabled(task) {
    task_name = task.task.replace(/(<([^>]+)>)/ig,"");
    data = loadTodo();
    var i = 0;
    for (var key in data) {
        if (data[key].task == task_name) {
          if (data[key].done == true) {
            return true;
          } else {
            return false;
          }
        }
    }
}

function disableButtonsDuringPomodoro() {
    $('#internalButton').removeClass('disabled');
    $('#externalButton').removeClass('disabled');
    
    $('#addTask').addClass('disabled');
    $('#removeSelected').addClass('disabled');
    $('#markAsDone').addClass('disabled');
    $('#infoModal').addClass('disabled');
    $('#settingsModalButton').addClass('disabled');
}

function enableButtonsDuringNonPomodoro() {
  $('#internalButton').addClass('disabled');
  $('#externalButton').addClass('disabled');
  
  $('#addTask').removeClass('disabled');
  $('#removeSelected').removeClass('disabled');
  $('#markAsDone').removeClass('disabled');
  $('#infoModal').removeClass('disabled');
  $('#settingsModalButton').removeClass('disabled');
}