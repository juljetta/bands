window.onload = async function() {
  var searchButton = document.getElementById("btn-search-events");
  var artistField = document.getElementById("id-artist");
  var goButton = document.getElementById("btn-create-route");
  const appId = "9e02c7a9ef14339e99edc2d7c86dda17";

  var selectedLocations = [];
  var homeAirport = "AMS";

  function findAirport(lat, lon) {
    return axios
      .get(
        `https://api.skypicker.com/locations?type=radius&lat=${lat}&lon=${lon}&radius=75&locale=en-US&location_types=airport&limit=1&active_only=true`
      )
      .then(response => {
        return response.data.locations[0].id;
      });
  }
  function findFlight(from, to) {
    return axios
      .get(
        `https://api.skypicker.com/flights?flyFrom=${from.airport}&to=${
          to.airport
        }&dateFrom=${convertDatetoKiwi(from.date)}&dateTo=${convertDatetoKiwi(
          to.date
        )}&partner=picky&limit=1`
      )
      .then(response => {
        var data = response.data.data;
        if (data.length > 0) {
          var result = {
            price: data[0].price,
            place: to,
            route: []
          };
          for (let i = 0; i < data[0].route.length; i++) {
            const route = data[0].route[i];
            result.route.push({
              cityFrom: route.cityFrom,
              cityTo: route.cityTo,
              flightNo: route.flight_no,
              airline: route.airline
            });
          }
          return result;
        } else {
          console.log(`No flight found from ${from.airport} to ${to.airport}`);
          return {
            place: to,
            price: false
          };
        }
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
        // console.log("events", response.data);

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
          var eventDate = parent.find("#card-date")[0].innerHTML;
          var eventCity = parent.find("#card-venue-city")[0].innerText;
          var eventVenue = parent.find("#card-venue-name")[0].innerText;
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
              id: id,
              eventDate: eventDate,
              eventCity: eventCity,
              eventVenue: eventVenue
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
    var eventContainer = document.getElementById("event-container");
    $(eventContainer).empty();
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
          <div class= "card-container">
            <h2>Searching...</h2>
          </div>
          `;
    // console.log(card);

    eventContainer.appendChild(card);
    // console.log(selectedLocations);

    // 1. create pairs of selected`locations
    var pairs = [];
    for (let i = 0; i <= selectedLocations.length; i++) {
      let to, from;
      if (i == 0) {
        // flying from home (first flight)
        from = {
          airport: homeAirport,
          date: new Date().toISOString()
        };
      } else {
        from = selectedLocations[i - 1];
      }

      if (i == selectedLocations.length) {
        // flying back home (last flight)
        to = {
          airport: homeAirport,
          date: from.date,
          eventCity: false
        };
      } else {
        to = selectedLocations[i];
      }

      pairs.push({ from: from, to: to });
    }

    // 2. for each pair findFlight
    var flightsPromises = [];
    pairs.forEach(pair => {
      flightsPromises.push(findFlight(pair.from, pair.to));
    });

    //3. wait for all flights to be ready
    Promise.all(flightsPromises).then(results => {
      console.log(results);

      var eventContainer = document.getElementById("event-container");
      $(eventContainer).empty();

      for (let index = 0; index < results.length; index++) {
        const flight = results[index];

        const route = document.createElement("div");

        if (flight.price == false) {
          route.innerHTML = `<h2>There is no flights to ${flight.place.eventCity}. Take a bus or train.</h2>`;
        } else {
          var list = document.createElement("ul");
          for (let i = 0; i < flight.route.length; i++) {
            const f = flight.route[i];
            var li = document.createElement("li");
            li.innerHTML = `${f.airline}${f.flightNo} ${f.cityFrom} - ${f.cityTo}`;
            list.appendChild(li);
          }
          route.appendChild(list);
          var price = document.createElement("h2");
          price.innerHTML = `EUR ${flight.price}`;
          route.appendChild(price);
        }
        eventContainer.appendChild(route);

        if (flight.place.eventCity == false) {
          // flying home, no next place card
          continue;
        }
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
         <div class= "card-container">
            <div id="card-date">
             <p> ${flight.place.eventDate}</p>
              </div>
            <div id = "card-venue-name">
              <p>${flight.place.eventVenue}</p>
            </div>
           
            <div id = "card-venue-city">
            <p>${flight.place.eventCity}</p>
            </div>
          </div>
          `;
        // console.log(card);

        eventContainer.appendChild(card);
      }
    });
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

function convertDatetoKiwi(dateOfEvent) {
  const date = new Date(dateOfEvent);
  var dd = date.getDate();
  var mm = date.getMonth() + 1; //January is 0!

  var yyyy = date.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  var dateFormatted = dd + "/" + mm + "/" + yyyy;
  return dateFormatted;
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
