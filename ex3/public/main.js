$(document).ready(function () {
  $("#openAddReminderModal").on("click", function () {
      if ($("#addReminderModal").is(":visible")) {
          $("#addReminderModal").hide();
      } else {
          resetModalFields();
          $("#addReminderModal").show();
      }
  });

  $("#closeModal").on("click", function () {
      resetModalFields();
      $("#addReminderModal").hide();
  });

  $("#saveReminder").on("click", function () {
      var reminderText = $("#reminderText").val();
      var reminderDate = $("#reminderDate").val();
      var reminderTime = $("#reminderTime").val();
      var description = $("#description").val();

      $.ajax({
          url: '/api/reminders',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ text: reminderText, date: reminderDate, time: reminderTime, description: description }),
          success: function (data) {

              resetModalFields();
              $("#addReminderModal").hide();

              updateReminderList();
          },
          error: function (error) {
              console.error('Error saving reminder:', error);
          }
      });
  });

  var sortOption = "notSorted";

  $(".dropdown-content a").on("click", function () {
      sortOption = $(this).data("sort");
      updateReminderList();
  });

  $("#searchInput").on("input", function () {
      var searchText = $(this).val().toLowerCase();
      filterReminders(searchText);
  });

  $("#todayButton").on("click", function () {
      filterRemindersByDate("today");
  });

  $("#thisWeekButton").on("click", function () {
      filterRemindersByDate("thisWeek");
  });

  $("#calendar").datepicker({
      onSelect: function (dateText, inst) {
          var selectedDate = new Date(dateText);
          filterRemindersByDate(selectedDate);
      }
  });

  $("#showAllButton").on("click", function () {
      $("#showCompleted").prop("checked", false);
      updateReminderList();
  });

  $("#showCompleted").on("change", function () {
      updateReminderList();
  });

  function updateReminderList() {
      $.ajax({
          url: '/api/reminders',
          type: 'GET',
          success: function (data) {
              var showCompleted = $("#showCompleted").prop("checked");

              data.sort(function (a, b) {
                  var dateA = new Date(a.date);
                  var dateB = new Date(b.date);

                  if (sortOption === "lowToHigh") {
                      return dateA - dateB;
                  } else if (sortOption === "highToLow") {
                      return dateB - dateA;
                  } else {
                      return 0;
                  }
              });

              var filteredReminders = data.filter(function (reminder) {
                  return showCompleted ? reminder.isDone : true;
              });

              displayReminderList(filteredReminders);
          },
          error: function (error) {
              console.error('Error fetching reminders:', error);
          }
      });
  }

  function displayReminderList(reminders) {
      $("#reminderList").empty();

      reminders.forEach(function (reminder) {
            var checkbox = '<input type="checkbox" id="checkbox_' + reminder.id + '" ' + (reminder.isDone ? 'checked' : '') + ' style="margin-right: 5px;">';
            var reminderText = '<p style="margin-top: 10px; font-size: 16px;">' +
                '<span style="color: #4CAF50; font-weight: bold;">' + reminder.text + '</span> - ' + reminder.description + '<br>' +
                '<span style="color: #555;">' + reminder.date + ' ' + reminder.time + '</span>' +
                '</p>';
        

          $("#reminderList").append('<div>' + checkbox + ' ' + reminderText + '</div>');

          $("#checkbox_" + reminder.id).on("change", function () {
              updateCompletionStatus(reminder.id, this.checked);
          });
      });
  }

  function filterReminders(searchText) {
      $.ajax({
          url: '/api/reminders',
          type: 'GET',
          success: function (data) {
              var filteredReminders = data.filter(function (reminder) {
                  return reminder.text.toLowerCase().includes(searchText);
              });
              displayReminderList(filteredReminders);
          },
          error: function (error) {
              console.error('Error fetching reminders:', error);
          }
      });
  }

  function filterRemindersByDate(selectedDate) {
      $.ajax({
          url: '/api/reminders',
          type: 'GET',
          success: function (data) {
              var filteredReminders = data.filter(function (reminder) {
                  var reminderDate = new Date(reminder.date);

                  if (selectedDate instanceof Date) {
                      return (
                          reminderDate >= selectedDate &&
                          reminderDate < new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
                      );
                  } else if (selectedDate === "today") {
                      var today = new Date();
                      today.setUTCHours(0, 0, 0, 0);

                      return (
                          reminderDate.getUTCFullYear() === today.getUTCFullYear() &&
                          reminderDate.getUTCMonth() === today.getUTCMonth() &&
                          reminderDate.getUTCDate() === today.getUTCDate()
                      );
                  } else if (selectedDate === "thisWeek") {
                      var startOfWeek = new Date();
                      startOfWeek.setUTCHours(0, 0, 0, 0);
                      startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay() + (startOfWeek.getUTCDay() === 0 ? -6 : 1));
  
                      var endOfWeek = new Date();
                      endOfWeek.setUTCHours(23, 59, 59, 999);
                      endOfWeek.setUTCDate(endOfWeek.getUTCDate() - endOfWeek.getUTCDay() + (endOfWeek.getUTCDay() === 0 ? 0 : 7));
  
                      return (
                          reminderDate >= startOfWeek && reminderDate <= endOfWeek
                      );
                  }
                  
              });

              displayReminderList(filteredReminders);
          },
          error: function (error) {
              console.error('Error fetching reminders:', error);
          }
      });
  }


  function updateCompletionStatus(reminderId, isDone) {
      $.ajax({
          url: '/api/reminders/' + reminderId,
          type: 'PATCH',
          contentType: 'application/json',
          data: JSON.stringify({ isDone: isDone }),
          success: function (data) {
              updateReminderList();
          },
          error: function (error) {
              console.error('Error updating completion status:', error);
          }
      });
  }

  function resetModalFields() {
      $("#reminderText").val("");
      $("#reminderDate").val("");
      $("#reminderTime").val("");
      $("#description").val("");
  }

  updateReminderList();
});
