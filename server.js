var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var WORDS = [
    "word", "letter", "number", "person", "pen", "class", "people",
    "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
    "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
    "land", "home", "hand", "house", "picture", "animal", "mother", "father",
    "brother", "sister", "world", "head", "page", "country", "question",
    "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
    "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
    "west", "child", "children", "example", "paper", "music", "river", "car",
    "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
    "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
    "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
    "space"
];

var word = '';
var clientID = 0;
var clientCount = 0;
var drawerID = null;

//Add socket connection to show the drawing
io.on('connection', function(socket) {
    console.log('Client connected');
    clientCount+=1;
    clientID+=1;
    //ID each new client with unique ID
    socket.id = clientID;
    
    socket.on('disconnect', function() {
        console.log('A user has disconnected '+socket.id);
        if (drawerID === socket.id) {
            socket.broadcast.emit('drawerDisconnect');
            drawerID = null;
        }
        clientCount-=1;
    });
    
    socket.on('draw', function(position) {
        socket.broadcast.emit('draw',position);
    });
    
    //Broadcast the guess to all clients
    socket.on('guess', function(guess) {
        socket.emit('guess',guess); //This should go to all clients, but is only going to emitting socket
        socket.broadcast.emit('guess',guess); //This should and does go to all clients but the emitting socket
        if (word === guess.toLowerCase()) {
            socket.emit('winner');
            socket.broadcast.emit('winner');
        }
    });
    
    //Listin for drawer selected
    socket.on('drawer', function() {
        if (drawerID === null) {
            var x = Math.floor(Math.random() * 100);
            word = WORDS[x];
            drawerID = socket.id;
            socket.emit('drawer',word);
            socket.broadcast.emit('drawer',word);
        }
        //Handle case if a new user joins during an active game
        else {
            socket.emit('gameOn');
        }
    });
    
    //Listen for reset
    socket.on('reset', function() {
        socket.broadcast.emit('reset');
        drawerID = null;
    });
});

server.listen(8080);