$("#scrape-btn").on("click", function (event) {
  // To prevent the default
  event.preventDefault();
  $("#articles").empty();

  $.getJSON("/articles", function (data) {

    for (let i = 0; i < data.length; i++) {

      $("#articles").append("<div class='articles-info'><h2 class='title' data-id='" + data[i]._id +
        "'>" + data[i].headline + "</h2>" +
        "<p class='summary'>" + data[i].summary + "</p>" +
        "<a href='" + data[i].url + "' target='_blank'>" + data[i].url + "</a></div>");
    }
  });
});

$("#hide-btn").on("click", function (event) {
  event.preventDefault();

  $("#articles").empty();
  $("#notes").empty();
})

$(document).on("click", ".title", function (event) {
  event.preventDefault();
  $("#notes").empty();
  // $(window).scrollTop(0);
  $("html, body").animate({
    scrollTop: 0
  }, "slow");

  const thisId = $(this).attr("data-id");

  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  }).then(function (data) {
    console.log(data);
    // Titles
    $("#notes").append("<h4 class='notes-title'>" + data.headline + "</h4>");

    $("#notes").append("<input id='titleInput' name='headline' placeholder='Name of Title'>");

    $("#notes").append("<textarea id='bodyInput' name='body' placeholder='Insert your comment here...'></textarea>");

    $("#notes").append("<button class='btn btn-primary' id='addComment' data-id='" + data._id + "'>Add Comment</button>");

    // If there's a note in the article
    if (data.note) {
      // Place the title of the note in the title input
      $("#titleInput").val(data.note.headline);
      // Place the body of the note in the body textarea
      $("#bodyInput").val(data.note.body);
    }
  });
});


$(document).on("click", "#addComment", function (event) {
  event.preventDefault();

  // Grab the id associated with the article from the submit button
  const thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      headline: $("#titleInput").val(),
      body: $("#bodyInput").val()
    }

  }).then(function (data) {
    // Log the response to test
    console.log(data);

    // Empty the notes section
    $("#notes").empty();
  });

  // remove the values entered for notes
  $("#titleInput").val("");
  $("#bodyInput").val("");
});