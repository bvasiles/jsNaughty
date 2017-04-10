$(document).ready(function() {
  
  var studentSelector = $('#student-selector'),
    courseSelector = $('#course-selector');

  studentSelector.select2();
  courseSelector.select2();

  
  // Try to build the student select list on the client because the
  // network connection in the school is so terrible.
  
  $.getJSON("/students.json", function (data) {
    $.each(data, function (i, s) {
      var student = $('<option></option>', {
        value: s.id,
        text: s.name
      }).appendTo(studentSelector);
    });
  });

  $.getJSON("/courses/teachers.json", function (data) {
    $.each(data, function (i, t) {
      var student = $('<option></option>', {
        value: t,
        text: t
      }).appendTo(courseSelector);
    });
  });

  // Tablesorter Defaults
  $("table#student-index").tablesorter( {sortList: [[1,0]] } ); 
  $("table#course-index").tablesorter( {sortList: [[0,0]] } ); 
  $("table#probation-index").tablesorter( {sortList: [[1,0]] } ); 
  $("table#course-show").tablesorter( {sortList: [[1,0]] } ); 
  $("table#student-show").tablesorter( {sortList: [[0,0]] } ); 


  var studentRows = $('table#student-index > tbody tr'),
      filterButtons = $('div#grade-filter button');

  filterButtons.on('click', function (e) {
    var activeRows, inactiveRows, grade = $(this).data("grade");
    e.preventDefault();
    if (grade === "all") {
      studentRows.show();
    } else {
      activeRows = studentRows.filter(function () {
        return $(this).data("grade") === grade;
      });
      inactiveRows = studentRows.filter(function () {
        return $(this).data("grade") !== grade;
      });
      activeRows.show();
      inactiveRows.hide();
    }
  });
});
