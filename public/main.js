var pictionary = function() {
    var canvas, context;
    var socket = io();

    var draw = function(position) {
        context.beginPath();
        context.arc(position.x, position.y,
                         6, 0, 2 * Math.PI);
        context.fill();
    };
    
    canvas = $('canvas');
    
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
        if (drawing) {
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
};

$(document).ready(function() {
    pictionary();
});