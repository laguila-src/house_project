
// We will create classes to represent: rooms, houses, house service 
// (to enable us to send http requests) and a class to manage the DOM.
// Create a House class

class House {
  constructor(name) {
    this.name = name;
    this.rooms = [];
  }

  addRoom(name, area) {
    this.rooms.push(new Room(name, area));
  }
}

class Room {
  constructor(name, area) {
    this.name = name;
    this.area = area; // how large is the room
  }
}

// Start creating the actual service, how to send the http request.
// We will use this HouseService inside of the next class we'll create which is our DOM manager

class HouseService {
  // The following is the root url for all the endpoints we are going to call the API

  static url = "https://643ecfc36c30feced833f509.mockapi.io/Houses";

  //   static url =
  // "https://62c85d578c90491c2cb47da3.mockapi.io/Promineo_Tech_API/houses";

  // Let's create a few different methods to send the request
  // getting house, getting all houses, getting a specific house, creating a house,
  // updating a house and deleting a house (all our CRUD operations)
  static getAllHouses() {
    return $.get(this.url); // we're going to return all of the houses from this URL
  }

  // Method to get a specific house
  static getHouse(id) {
    return $.get(this.url + `/${id}`);
  }

  static createHouse(house) {
    return $.post(this.url, house); // the house that was passed to the http payload
  }


  static updateHouse(house) {
    return $.ajax({
      // using ajax on our jquery object
      url: this.url + `/${house._id}`, // using a mongo DB here
      dataType: "json",
      data: JSON.stringify(house), // payload - this takes an object and send it as a string for HTTP request
      contentType: "application/json",
      type: "PUT", // a PUT request
    });
  }

  static deleteHouse(id) {
    return $.ajax({
      url: this.url + `/${id}`,
      type: "DELETE",
    });
  }
}

// Create the DOM manager class

class DOMManager {
  static houses; // represents all the houses in this class

  static getAllHouses() {
    HouseService.getAllHouses().then((houses) => this.render(houses));
  }

  static createHouse(name) {
    HouseService.createHouse(new House(name))
      .then(() => {
        return HouseService.getAllHouses();
      })
      .then((houses) => this.render(houses));
  }

  static deleteHouse(id) {
    HouseService.deleteHouse(id)
      .then(() => {
        return HouseService.getAllHouses();
      })
      .then((houses) => this.render(houses));
  }

  static addRoom(id) {
    for (let house of this.houses) {
      if (house._id == id) {
        house.rooms.push(
          new Room(
            $(`#${house._id}-room.name`).val(),
            $(`#${house._id}-room.area`).val()
          )
        );
        HouseService.updateHouse(house)
          .then(() => {
            return HouseService.getAllHouses();
          })
          .then(houses > this.render(houses));
      }
    }
  }

  static deleteRoom(houseId, roomId) {
    for (let house of this.houses) {
      if (house._id == houseId) {
        for (let room of house.rooms) {
          if (room._id == roomId) {
            house.rooms.splice(house.rooms.indexOf(room), 1);
            HouseService.updateHouse(house)
              .then(() => {
                return HouseService.getAllHouses();
              })
              .then((houses) => this.render(houses));
          }
        }
      }
    }
  }

  static render(houses) {
    this.houses = houses;
    $("#app").empty();
    // Now we need a for loop to render the houses. prepend so new one shows in the top
    for (let house of houses) {
      $("#app").prepend(
        `<div id="${house._id}" class="card">
			<div class ="card-header">
				<h2>${house.name}</h2>
				<button class="btn btn-danger" onclick="DOMManager.deleteHouse('${house._id}')">Delete</button>
			</div>
			<div class="card-body">
				<div class ="card">
					<div class="row">
						<div class="col-sm">
							<input type="text" id="${house._id}-room-name" class="form-control" placeholder="Room Name">
						</div>
						<div class="col-sm">
							<input type="text" id="${house._id}-room-area" class="form-control" placeholder="Room Area">
						</div>
					</div>
					<button id="${house._id}-new-room" onclick="DOMManager.addRoom('${house._id}')" class="btn btn-primary form-control">Add</button>
				</div>
			</div>
		</div><br>`
      );
      for (let room of house.rooms) {
        $(`#${house._id}`)
          .find(".card-body")
          .append(
            `<p>
			<span id="name-${room._id}"><strong>Name: </strong> ${room.name}</span>
			<span id="area-${room._id}"><strong>Area: </strong> ${room.area}</span>
			<button class="btn btn-danger" onclick="DOMManager.deleteRoom('${house._id}', '${room._id}')">Delete Room</button>`
          );
      }
    }
  }
}

$("#create-new-house").click(() => {
  DOMManager.createHouse($("#new-house-name").val());
  $("#new-house-name").val("");
});

// To test rendering the houses
DOMManager.getAllHouses();
