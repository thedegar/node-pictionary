var pictionary = function() {
    var canvas, context;
    var socket = io();

    var reset = function() {
        drawer = false;
        drawing = false;
        $("#top-message,#win,.wrapper div").hide();
        $(".wrapper, #start, #guess").show();
        $("#lastGuess").text('');
        $("#win h3").text('Winner Winner Chicken Dinner!!!');
        context = canvas[0].getContext('2d');
        canvas[0].width = canvas[0].offsetWidth;
        canvas[0].height = canvas[0].offsetHeight;
    };
    
    var draw = function(position) {
        context.beginPath();
        context.arc(position.x, position.y,
                         6, 0, 2 * Math.PI);
        context.fill();
    };
    
    canvas = $('canvas');
    
    //Handle a socket choosing to draw
    var drawer = false;
    $("#top-message,#win").hide();
    $(".wrapper div").hide();
    
    var someoneDrawing = function() {
        $("#top-message").show();
        $("button").hide();
    };
    
    $("#start").on("click", function() {
        socket.emit('drawer');
        $("#top-message,.wrapper div").show();
        $("#guess, button").hide();
        drawer = true;
    });
    
    socket.on('drawer', function(word) {
        someoneDrawing();
        $("#toDraw").text(word);
    });
    
    //Make canvas only draw when mousedown is true
    var drawing = false;
    
    canvas.on('mousedown', function() {
        drawing = true;
    });
    
    canvas.on('mouseup', function() {
        drawing = false;
    });
    
    context = canvas[0].getContext('2d');
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
    canvas.on('mousemove', function(event) {
        if (drawing === true && drawer === true) {
            var offset = canvas.offset();
            var position = {x: event.pageX - offset.left,
                            y: event.pageY - offset.top};
            draw(position);
            //Add socket connection to show the drawing
            socket.emit('draw',position);
        }
    });
    
    //Add socket connection to show the drawing
    socket.on('draw',draw);  //***question*** why don't you have to pass a variable into draw() here?
    
    //Add guess box
    var guessBox;

    var onKeyDown = function(event) {
        if (event.keyCode != 13) { // Enter
            return;
        }
        
        //Emit guess to server
        var guess = guessBox.val();
        socket.emit('guess',guess);
        guessBox.val('');
    };

    guessBox = $('#guess input');
    guessBox.on('keydown', onKeyDown);
    
    //listen for guess
    socket.on('guess',function(guess) {
        //display the guesses
        $("#lastGuess").text(guess);
    });
    
    var winning = function() {
        $("#win,#win button").show();
        $("#top-message,.wrapper").hide();
        drawing = false;
        drawer = false;
    };
    
    //handle winning guess
    socket.on('winner',function() {
        winning();
    });
    
    //reset game
    $("#reset").on("click", function() {
        socket.emit('reset');
        reset();
    });
    
    //Listen for reset
    socket.on('reset', function() {
        reset();
    });
    
    //Listen for drawer disconnect
    socket.on('drawerDisconnect', function() {
        winning();
        $("#win h3").text('The drawer disconnected...');
    });
    
    //Listen for game on going
    socket.on('gameOn', function() {
        winning();
        $("#win h3").text('Other users are still playing, please wait.').show();
        $("#win button").hide();
    });
};

$(document).ready(function() {
    pictionary();
});