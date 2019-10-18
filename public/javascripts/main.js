window.onload = async function() {
  var searchButton = document.getElementById("btn-search-events");
  var artistField = document.getElementById("id-artist");
  var goButton = document.getElementById("btn-create-route");
  const appId = "9e02c7a9ef14339e99edc2d7c86dda17";

  var selectedLocations = [
    {
      id: -1,
      airport: "AMS",
      date: "2019-10-17T19:00:00"
    }
  ];

  function findAirport(lat, lon) {
    return axios
      .get(
        `https://api.skypicker.com/locations?type=radius&lat=${lat}&lon=${lon}&radius=75&locale=en-US&location_types=airport&limit=1&active_only=true`
      )
      .then(response => {
        return response.data.locations[0].id;
      });
  }

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
        console.log("events", response.data);

        var eventContainer = document.getElementById("event-container");
        $(eventContainer).empty();

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
            <button data-id="${i}" data-datetime="${response.data[i].datetime}" data-lat="${response.data[i].venue.latitude}" data-lon="${response.data[i].venue.longitude}" type="button" class="btn-add-to-route">Add to Route</button>
          </div>
          `;
          // console.log(card);

          eventContainer.appendChild(card);
        }

        var addButtons = $(".btn-add-to-route");

        addButtons.click(function() {
          var clickedButton = $(this);
          var parent = $(this).parent();
          var eventDate = parent.find("#card-date")[0].innerText;
          var eventCity = parent.find("#card-venue-city")[0].innerText;
          var routeContainer = $("#route-container");
          const id = clickedButton.data("id");
          const lat = clickedButton.data("lat");
          const lon = clickedButton.data("lon");
          const orignalDate = clickedButton.data("datetime");

          // debugger;
          if (clickedButton.hasClass("pressed-button")) {
            $(routeContainer)
              .find(`.route-point[data-id=${id}]`)
              .remove();
            clickedButton.removeClass("pressed-button");
            clickedButton.text("Add to Route");

            selectedLocations = selectedLocations.filter(function(location) {
              return location.id != id;
            });

            // find all route-points
            // if routepoint id === pressedBtn id
            // then remove

            return;
          }

          clickedButton.addClass("pressed-button");
          clickedButton.text("Added");

          routeContainer.find("#btn-create-route").remove();
          routeContainer.find(".empty-point").remove();
          routeContainer.append(
            $(`<div class="route-point" data-id=${id}>
      <p>${eventCity}</p> <p>${eventDate}</p>
    </div>`)
          );
          routeContainer.append(
            $(`<div class="empty-point">
      <p> Next Destination </p>
    </div>`)
          );
          routeContainer.append(
            $(`<button id="btn-create-route">Go!</button>`)
          );

          document.getElementById("btn-create-route").onclick = createRoute;

          findAirport(lat, lon).then(airportCode => {
            selectedLocations.push({
              airport: airportCode,
              date: orignalDate,
              id: id
            });
          });

          // console.log(eventCity, eventDate);

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

  function createRoute() {
    console.log(selectedLocations);
  }

  goButton.onclick = createRoute;
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
