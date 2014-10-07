var express = require('express');
var app = express();
var update = -1;

app.get('/', function(req, res){
	res.status(200);
	res.sendFile(__dirname + "/index.html");
});

app.post('/login/:user', function(req, res)
{
	if (user_data[req.params.user] == null) {		 // Stomp your feet
		user_data[req.params.user] = {"inventory" : ["Piece of Pie"], "loc" : ["strong-hall"]};
		res.set({'Content-Type': 'application/json'});
		res.status(200);
		res.send([]);
		return;
	}
	else
	{
	res.set({'Content-Type': 'application/json'});
	res.status(200);
	res.send(user_data);
	return;
	}
});

app.get('/:user/:id', function(req, res){

	if (req.params.id == "inventory") 
	{
	    res.set({'Content-Type': 'application/json'});
	    res.status(200);
	    res.send(user_data[req.params.user].inventory);
	    return;
	}
	if(req.params.id == "location")
	{
		res.set({'Content-Type': 'application/json'});
	   res.status(200);
		console.log(user_data[req.params.user]);
		console.log(user_data[req.params.user].loc);
		res.send(user_data[req.params.user].loc);
		return;
	}
	for (var i in campus) 
	{
		if (req.params.id == campus[i].id) 
		{
		    res.set({'Content-Type': 'application/json'});
		    res.status(200);
		    res.send(campus[i]);
			//console.log("User: " + req.params.user)
			//console.log("ID: " + req.params.id)
			//console.log(user_data[req.params.user]);
			//console.log(user_data[req.params.user].loc);
			//console.log(user_data[req.params.user].loc[0]);
			//console.log(campus[i]);
			//console.log(campus[i].id);
			if (req.params.user != 'getupdate') 
			{
				user_data[req.params.user].loc[0] = campus[i].id;
			}
		    return;
		}
	}
	res.status(404);
	res.send("not found, sorry");
});

app.get('/getupdate/:id', function(req, res)
{
		for (var i in campus) 
		{
			if (req.params.id == campus[i].id) 
			{
		    	res.set({'Content-Type': 'application/json'});
		    	res.status(200);
		    	res.send(campus[i].update);
		    	return;
			}
		}
		
		res.status(404);
		res.send("location not found");
});

app.get('/:user/images/:name', function(req, res){
	res.status(200);
	res.sendFile(__dirname + "/" + req.params.name);
});

app.delete('/:user/:id/:item', function(req, res){
	for (var i in campus) {
		if (req.params.id == campus[i].id) {
		    res.set({'Content-Type': 'application/json'});
		    var ix = -1;
		    if (campus[i].what != undefined) {
					ix = campus[i].what.indexOf(req.params.item);
		    }
		    if (ix >= 0) {
		       res.status(200);
			user_data[req.params.user].inventory.push(campus[i].what[ix]); // stash
		        res.send(user_data[req.params.user].inventory);
			campus[i].what.splice(ix, 1); // room no longer has this
			++campus[i].update;
			return;
		    }
		    res.status(200);
		    res.send([]);
		    return;
		}
	}
	res.status(404);
	res.send("location not found");
});

app.put('/:user/:id/:item', function(req, res){
	for (var i in campus) {
		if (req.params.id == campus[i].id) {
				// Check you have this
				var ix = user_data[req.params.user].inventory.indexOf(req.params.item);
				if (ix >= 0) {
					dropbox(ix,campus[i],req.params.user);
					res.set({'Content-Type': 'application/json'});
					res.status(200);
					++campus[i].update;
					res.send([]);
				} else {
					res.status(404);
					res.send("you do not have this");
				}
				return;
		}
	}
	res.status(404);
	res.send("location not found");
});

app.listen(3000);

var dropbox = function(ix,room,user) {
	var item = user_data[user].inventory[ix];
	user_data[user].inventory.splice(ix, 1);	 // remove from inventory
	if (room.id == 'allen-fieldhouse' && item == "basketball") {
		room.text	+= " Someone found the ball so there is a game going on!"
		return;
	}
	if (room.what == undefined) {
		room.what = [];
	}
	room.what.push(item);
}

var storeAll = function(){
	storeUser();
	storeCampus();
}

var storeUser = function(){
	var fs = require('fs');
	var stream = fs.createWriteStream("user_data.txt");

	stream.once('open', function(fd) {
	stream.write(JSON.stringify(user_data));
	stream.end(); 
		});
}

var storeCampus = function(){
	var fs = require('fs');
	var stream = fs.createWriteStream("campus.txt");

	stream.once('open', function(fd) {
	stream.write(JSON.stringify(campus));
	stream.end(); 
		});
}

var user_data = { NAME: {"inventory" : ["laptop"], "loc" : ["strong-hall"] }, PHILIP: {"inventory" : ["Philip's Diary"], "loc" : ["strong-hall"] }}

var campus =
    [ { "id": "lied-center",
	"where": "LiedCenter.jpg",
	"next": {"east": "eaton-hall", "south": "dole-institute"},
	"text": "You are outside the Lied Center.",
	"update" : 0,
	"people" : []
      },
      { "id": "dole-institute",
	"where": "DoleInstituteofPolitics.jpg",
	"next": {"east": "allen-fieldhouse", "north": "lied-center"},
	"text": "You take in the view of the Dole Institute of Politics. This is the best part of your walk to Nichols Hall.",
	"update" : 0,
	"people" : []
      },
      { "id": "eaton-hall",
	"where": "EatonHall.jpg",
	"next": {"east": "snow-hall", "south": "allen-fieldhouse", "west": "lied-center"},
	"text": "You are outside Eaton Hall. You should recognize here.",
	"update" : 0,
	"people" : []
      },
      { "id": "snow-hall",
	"where": "SnowHall.jpg",
	"next": {"east": "strong-hall", "south": "ambler-recreation", "west": "eaton-hall"},
	"text": "You are outside Snow Hall. Math class? Waiting for the bus?",
	"update" : 0,
	"people" : []
      },
      { "id": "strong-hall",
	"where": "StrongHall.jpg",
	"next": {"east": "outside-fraser", "north": "memorial-stadium", "west": "snow-hall"},
	"what": ["coffee"],
	"text": "You are outside Stong Hall.",
	"update" : 0,
	"people" : []
      },
      { "id": "ambler-recreation",
	"where": "AmblerRecreation.jpg",
	"next": {"west": "allen-fieldhouse", "north": "snow-hall"},
	"text": "It's the starting of the semester, and you feel motivated to be at the Gym. Let's see about that in 3 weeks.",
	"update" : 0,
	"people" : []
      },
      { "id": "outside-fraser",
  "where": "OutsideFraserHall.jpg",
	"next": {"west": "strong-hall","north":"spencer-museum"},
	"what": ["basketball"],
	"text": "On your walk to the Kansas Union, you wish you had class outside.",
	"update" : 0
      },
      { "id": "spencer-museum",
	"where": "SpencerMuseum.jpg",
	"next": {"south": "outside-fraser","west":"memorial-stadium"},
	"what": ["art"],
	"text": "You are at the Spencer Museum of Art.",
	"update" : 0,
	"people" : []
      },
      { "id": "memorial-stadium",
	"where": "MemorialStadium.jpg",
	"next": {"south": "strong-hall","east":"spencer-museum"},
	"what": ["ku flag"],
	"text": "Half the crowd is wearing KU Basketball gear at the football game.",
	"update" : 0,
	"people" : []
      },
      { "id": "allen-fieldhouse",
	"where": "AllenFieldhouse.jpg",
	"next": {"north": "eaton-hall","east": "ambler-recreation","west": "dole-institute"},
	"text": "Rock Chalk! You're at the field house.",
	"update" : 0,
	"people" : []
      }
    ]
