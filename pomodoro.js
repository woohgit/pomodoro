counter = 0;
DEFAULT_LONG_BREAK = 1500;
DEFAULT_SHORT_BREAK = 300;
counterBack = 0;

workingPomodoro = 5;
shortBreak = 2;
longBreak = 3;

i = workingPomodoro;

selected_task = '';


coffeText = {
    image: '<i class="fa fa-coffee fa-5x" aria-hidden="true"></i>',
    text: "It's time for a coffee break!"
};
workText = {
    image: '<i class="fa fa-keyboard-o fa-5x" aria-hidden="true"></i>',
    text: "It's time to go back to work!"
};
longbreakText = {
    image: '<i class="fa fa-coffee fa-5x" aria-hidden="true"></i>',
    text: "It's time for a long break!"
};

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
    }
    catch (err) {}

    // an empty array is a valid data source for the the bootstap-table
    if (data === null) {
        data = [];
    }

    return data;
}


function loadUnplanned() {

    var data = null;

    try {
        data = JSON.parse(localStorage.getItem("unplannedData"));
    }
    catch (err) {}

    // an empty array is a valid data source for the the bootstap-table
    if (data === null) {
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
    s = seconds / pomodoroConfig[counter - 1] * 100;
    return s;
}

function startCounting() {

    if (counter >= 8) {
        counter = 0;
        $('#pbar').removeClass('active');
    } else {
        $('#pbar').addClass('active');
    }

    i = pomodoroConfig[counter];

    counter++;

    counterBack = setInterval(function() {
        i--;
        if (i >= 0) {
            $('.progress-bar').css('width', calculatePercent(i) + '%');
            $('#panel-footer').text(formatSeconds(i));
        }
        else {
            notifyMe('Times UP!', messageConfig[counter].text);
            clearInterval(counterBack);
            var modal = $('#myModal')
            modal.find('.modal-title').html(messageConfig[counter].image);
            modal.find('.modal-body').html(messageConfig[counter].text);
            $('.progress-bar').css('width', '100%');
            $('#pbar').removeClass('active');
            // Every odd number is a pomodoro
            // don't let switching task before a break!
            // also increase pomodoros only when working not when having a break
            if (counter % 2 > 0) {
                $("#switchTask").hide();
                increasePomodoro();
                loadTasks();
            }
            else {
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
document.addEventListener('DOMContentLoaded', function() {
    if (!Notification) {
        alert('Desktop notifications not available in your browser. Try Chromium.');
        return;
    }

    if (Notification.permission !== "granted")
        Notification.requestPermission();
});

function audioNotification() {
    var alertSound = new Audio('demonstrative.mp3');
    alertSound.play();
}

function notifyMe(title, message) {

    try {
        settings = JSON.parse(localStorage.getItem("pomodoro_settings"));
        if (settings.notification == false) {
            return;
        }
    }
    catch (err) {
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

        notification.onclick = function() {
            window.open("http://stackoverflow.com/a/13328397/1269037");
        };
    }
}

function loadTasks() {
    data = loadTodo();
    $('#todo_count').html(data.length);
    $('#todo_table').bootstrapTable('load', data);

    data = loadUnplanned();
    $('#unplanned_count').html(data.length);
    $('#unplanned_table').bootstrapTable('load', data);
}

function populateTasks() {

    data = loadTodo();
    $('#todo_count').html(data.length);

    $('#todo_table').bootstrapTable({
        columns: [{
            checkbox: true,
            formatter: stateFormatter
        }, {
            width: 400,
            field: 'task',
            title: 'Task name'
        }, {
            field: 'pomodoros',
            title: pomodoroGlyph + ' Pomodoros'
        }, {
            field: 'internal',
            title: internalInterrupt + ' Internal'
        }, {
            field: 'external',
            title: externalInterrupt + ' External'
        }],
        data: data
    });


    data = loadUnplanned();
    $('#unplanned_count').html(data.length);

    $('#unplanned_table').bootstrapTable({
        columns: [{
            checkbox: true,
            formatter: stateFormatter
        }, {
            width: 400,
            field: 'task',
            title: 'Unplanned task'
        }],
        data: data
    });
}

function saveTasks(data) {
    localStorage.setItem("todoData", JSON.stringify(data));
}


function addNewTodoItem(name) {
    data = loadTodo();
    data.push({
        task: name,
        pomodoros: 0,
        external: 0,
        internal: 0,
        done: false
    });
    saveTasks(data);
    loadTasks();
}


function saveUnplanned(data) {
    localStorage.setItem("unplannedData", JSON.stringify(data));
}


function addNewUnplanned(name) {
    data = loadUnplanned();
    data.push({
        task: name
    });
    saveUnplanned(data);
    loadTasks();
}


function initializeSettings() {

    try {

        var lb = JSON.parse(localStorage.getItem("pomodoro_settings"));
        longBreak = lb;

    }
    catch (err) {

        longBreak = 25 * 60;

    }

}

$(document).ready(function() {

    initializeSettings();

    //localStorage.clear();
    populateTasks();
});

function cellStyle(value, row, index, field) {
    return {
        css: {
            "font-size": "10px"
        }
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

function saveSettings(longBreak, notification, shortBreak) {

    long_break = convertStringTimeToSeconds(longBreak);
    short_break = convertStringTimeToSeconds(shortBreak);
    data = {
        'long_break': long_break,
        'notification': notification,
        'short_break': short_break
    };
    localStorage.setItem("pomodoro_settings", JSON.stringify(data));
}

function saveSelectedTask(task) {
    localStorage.setItem("selected_task", JSON.stringify(task));
}

function getSelectedTask() {
    selected_task = null;
    try {
        selected_task = JSON.parse(localStorage.getItem("selected_task"));
    }
    catch (e) {}

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

    st = $('#todo_table').bootstrapTable('getSelections');

    if (st.length == 0) {
        return;
    }

    task_name = st[0].task.replace(/(<([^>]+)>)/ig, "");

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

    st = $('#todo_table').bootstrapTable('getSelections');

    if (st == '') {
        return;
    }
    st = st[0];

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
    task_name = task.task.replace(/(<([^>]+)>)/ig, "");
    data = loadTodo();
    var i = 0;
    for (var key in data) {
        if (data[key].task == task_name) {
            if (data[key].done == true) {
                return true;
            }
            else {
                return false;
            }
        }
    }
}

function disableButtonsDuringPomodoro() {

    $('#internalButton').removeClass('disabled');
    $('#externalButton').removeClass('disabled');
    $('#internalButton').prop('disabled', false);
    $('#externalButton').prop('disabled', false);

    $('#addTask').addClass('disabled');
    $('#addTask').prop('disabled', true);

    $('#removeSelected').addClass('disabled');
    $('#removeSelected').prop('disabled', true);

    $('#markAsDone').addClass('disabled');
    $('#markAsDone').prop('disabled', true);
    $('#rulesModal').addClass('disabled');
    $('#rulesModal').prop('disabled', true);
    $('#settingsModalButton').addClass('disabled');
    $('#settingsModalButton').prop('disabled', true);
}

function enableButtonsDuringNonPomodoro() {
    $('#internalButton').addClass('disabled');
    $('#internalButton').prop('disabled', true);
    $('#externalButton').addClass('disabled');
    $('#externalButton').prop('disabled', true);

    $('#addTask').removeClass('disabled');
    $('#addTask').prop('disabled', false);
    $('#removeSelected').removeClass('disabled');
    $('#removeSelected').prop('disabled', false);
    $('#markAsDone').removeClass('disabled');
    $('#markAsDone').prop('disabled', false);
    $('#rulesModal').removeClass('disabled');
    $('#rulesModal').prop('disabled', false);
    $('#settingsModalButton').removeClass('disabled');
    $('#settingsModalButton').prop('disabled', false);
}

function getLongBreak() {

    settings = JSON.parse(localStorage.getItem("pomodoro_settings"));
    if (settings == null) {
        return DEFAULT_LONG_BREAK;
    }

    if (settings.long_break == null) {
        return DEFAULT_LONG_BREAK
    }

    return settings.long_break;
}

function getShortBreak() {
    settings = JSON.parse(localStorage.getItem("pomodoro_settings"));
    if (settings == null) {
        return DEFAULT_SHORT_BREAK;
    }

    if (settings.short_break == null) {
        return DEFAULT_SHORT_BREAK
    }

    return settings.short_break;
}

function increaseInterrupt(type) {

    st = getSelectedTask();
    task_name = st.task;

    data = loadTodo();
    for (var key in data) {
        if (data[key].task == task_name) {
            if (type == 'internal') {
                data[key].internal += 1;
            }
            else {
                data[key].external += 1;
            }
        }

    }
    saveTasks(data);
    loadTasks();
}

function cleanupUnplanned() {
    data = [];
    saveUnplanned(data);
    loadTasks();
}