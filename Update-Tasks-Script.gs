// Author: Christian Overton
// Website: CTOverton.com
//
// ================================================================================
// Description:
// This script will keep your google tasks up to date. 
// When a task is overdue it will move it to the current day.
// * Make sure to enable the "Tasks API" in Resources>Advanced Google Services *
// * Make sure to setup a time driven trigger to automate this script *
// ================================================================================
//
// Credit:
// Serge insas - For custom parse function
// tehhowch    - For patching tasks with new due date

function myFunction() {
// Check's every task list for outdated tasks and updates them to current day
  updateEveryList(); 
  
// OR Enter a specific list ID you want to keep updated
// updateSpecificList("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"); 
// listTaskLists(); // Use to log task lists and IDs
}

// Check's every task list for outdated tasks and updates them to current day
function updateEveryList() {
  var taskLists = Tasks.Tasklists.list();
  if (taskLists.items) {
    for (var i = 0; i < taskLists.items.length; i++) {
      var taskList = taskLists.items[i];
      Logger.log('Checking List: %s', taskList.title)
      checkOverdue(getTasks(taskList), taskList.id);
    }
  } else {
    Logger.log('No task lists found.');
  }  
}

// Check's a specific task list for outdated tasks and updates them to current day
function updateSpecificList(taskList) {
  if (taskList) {
    checkOverdue(getTasks(taskList), taskList.id);
  } else {
    Logger.log('No task list found.');
  }  
}

// Returns all tasks in a given list
function getTasks(taskList) {
  return Tasks.Tasks.list(taskList.id);
}

// Check's a specific task list for outdated tasks and updates them to current day
function checkOverdue(taskList, taskListID) {
  if (taskList.items) {
    for (var i = 0; i < taskList.items.length; i++) {
      var task = taskList.items[i];
      if (isOverdue(task)) {
        Logger.log('%s is overdue', task.title);
        updateTaskDue(taskListID, task);
      }
    }
  } else {
    Logger.log('No tasks found.');
  }
}

// Checks whether a task is overdue, returns true or false
function isOverdue(task) {
  if(!task.due)
    return false;

  var today = new Date(new Date().setHours(0,0,0,0));
  var taskDueDate = new Date(new Date(parseDate_RFC3339(task.due)).setHours(0,0,0,0));
  return taskDueDate < today;
}

// Custom parse function to return task.due string to a proper date object (with correct day!)
function parseDate_RFC3339(string) {
  var refStr = new Date().toString();
  var tzOffset = Number(refStr.substr(refStr.indexOf('GMT')+4,2));
  var parts = string.split('T');
  parts[0] = parts[0].replace(/-/g, '/');
  var t = parts[1].split(':');
  return new Date(new Date(parts[0]).setHours(+t[0]+tzOffset,+t[1],0));
}

// Updates a task from a given list to the current day
function updateTaskDue(taskListID, task) {
  var today = new Date(new Date().setHours(0,0,0,0));
  var oldDueDate = new Date(new Date(parseDate_RFC3339(task.due)).setHours(0,0,0,0));
  var newTask = {
    due: Utilities.formatDate(today, "GMT", "yyyy-MM-dd'T'HH:mm:ss'Z'")
  };
  
  Logger.log('Changing due date from %s to %s', oldDueDate, today);
  Tasks.Tasks.patch(newTask, taskListID, task.id);
}

// Logs all task lists
function listTaskLists() {
  var taskLists = Tasks.Tasklists.list();
  if (taskLists.items) {
    for (var i = 0; i < taskLists.items.length; i++) {
      var taskList = taskLists.items[i];
      Logger.log('Task list with title "%s" and ID "%s" was found.',
                 taskList.title, taskList.id);
    }
  } else {
    Logger.log('No task lists found.');
  }
}
