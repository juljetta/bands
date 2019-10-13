window.onload = async function() {
  var searchButton = document.getElementById("btn-search-events");
  var artistField = document.getElementById("id-artist");
  const appId = "9e02c7a9ef14339e99edc2d7c86dda17";

  function searchArtist() {
    var artist = artistField.value;
    if (artist === "") {
      alert("Fill-in artist field");
      return;
    }
    axios
      .get(`https://rest.bandsintown.com/artists/${artist}?app_id=${appId}`)
      .then(response => {
        // console.log(response.data);
        var artistImage = document.getElementById("img-artist-small");
        var artistName = document.getElementById("artist-name");
        artistName.innerHTML = response.data.name;
        artistImage.src = response.data.thumb_url;
      })

      .catch(err => {
        console.log(err);
      });
  }

  function searchEvents() {
    var artist = artistField.value;
    axios
      .get(
        `https://rest.bandsintown.com/artists/${artist}/events?app_id=${appId}`
      )
      .then(response => {
        // console.log("events", response.data);
        var eventContainer = document.getElementById("event-container");
        for (let i = 0; i < response.data.length; i++) {
          const card = document.createElement("div");
          const date = convertDate(response.data[i].datetime);
          card.className = "card";
          card.innerHTML = `
          <div class= "card-container">
            <div id="card-date">
              ${date}
              </div>
            <div id = "card-venue-name">
              <p>${response.data[i].venue.name}</p>
            </div>
           
            <div id = "card-venue-city">
            <p>${response.data[i].venue.city}, ${response.data[i].venue.country}</p>
            </div>
            <button type="button" class="btn-add-to-route">Add to Route</button>
          </div>
          `;
          // console.log(card);
          eventContainer.appendChild(card);
        }

        var addButtons = $(".btn-add-to-route");

        addButtons.click(function() {
          var clickedButton = $(this);
          if (clickedButton.hasClass("pressed-button")) {
            return;
          }
          clickedButton.addClass("pressed-button");
          clickedButton.text("Added");

          var parent = $(this).parent();
          var eventDate = parent.find("#card-date")[0].innerText;
          var eventCity = parent.find("#card-venue-city")[0].innerText;
          var routeContainer = $("#route-container");
          routeContainer.find(".empty-point").remove();
          routeContainer.append(
            $(`<div class="route-point">
      <p>${eventCity}</p> <p>${eventDate}</p>
    </div>`)
          );
          routeContainer.append(
            $(`<div class="empty-point">
      <p></p>
    </div>`)
          );

          console.log(eventCity, eventDate);

          // debugger;
        });

        // We make a container to which we append items to.
      })
      .catch(err => {
        console.log(err);
      });
  }

  searchButton.onclick = function() {
    searchArtist();
    searchEvents();
  };
};

//2019-11-02T19:00:08
function convertDate(dateOfEvent) {
  const date = new Date(dateOfEvent);
  const day = date.getDate();
  const monthNumber = date.getMonth();
  const monthName = monthToName(monthNumber);
  return `<p>${day} <br> ${monthName}</p>`;
}

function monthToName(monthNumber) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  return monthNames[monthNumber];
}
