const y = 5;
const width = 30;
const length = 120;
let lastX = {x : 0};

window.onload = () => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    context.scale(width/25, length / 100);
    drawU(context, lastX);
    context.scale(width/25, length / 100);
    drawK(context, lastX);
    context.scale(width/25, length / 100);
    drawV(context, lastX);
}

function drawU(context, lastX) {

    const x = 30;

    context.translate(x, y);
    context.fillStyle = "rgba(123, 255, 0, 0.88)";
    context.rotate(1.57);
    context.fillRect(0, 0, length, width);
    
    context.translate(length, width);
    context.rotate(-1.57);
    context.fillRect(0, 0, length, width);

    context.translate(length, -length);
    context.rotate(1.57);
    context.fillRect(0, 0, length, width);

    context.translate(length, 0);
    context.fillRect(0, 0, length, width);
    
    context.translate(length, 0);
    context.rotate(1.57);
    context.fillRect(0, 0, length, width);

    lastX.x = length + length * 0.3;

    context.setTransform(1,0,0,1,0,0);
}

function drawK(context, lastX) {
    const x = 30 + lastX.x;

    context.translate(x, y);
    context.fillStyle = "rgb(2, 151, 59)";
    context.rotate(1.57);
    context.fillRect(0, 0, length, width);
    
    context.translate(length, 0);
    context.fillRect(0, 0, length, width);

    context.translate( (length - x + width) / 2 , 0);
    context.rotate(-0.7853);
    context.fillRect(0, 0, length * 1.4, width);

    context.rotate(-1.57);
    context.fillRect(0, 0, length * 1.2, width);

    lastX.x = length * 1.4 + length * 1.2 + length * 0.3;

    context.setTransform(1,0,0,1,0,0);
}

function drawV(context, lastX) {
    const x = 30 + lastX.x;
    let startAngle = -(Math.PI / 180) * 90;
    let endAngle = -(Math.PI / 180) * 270;

    fillStyle = "rgb(0, 222, 252)";

    context.translate(x, y);
    context.fillStyle = fillStyle;
    context.rotate(1.57);
    context.fillRect(0, 0, length, width);
    
    context.translate(length, 0);
    context.fillRect(0, 0, length, width);

    context.translate( length - width , 0);
    context.rotate(-1.57);
    context.fillRect(0, 0, length / 2, width);

    context.translate( 0 , -length * 2 + width);
    context.fillRect(0, 0, length / 4, width);

    context.translate( length / 4, width * 2);
    
    context.strokeStyle = fillStyle;
    context.beginPath();
    context.arc(0, 0, length / 2 - width / 2, startAngle, endAngle, false);
    context.lineWidth = width;
    context.stroke();

    context.fillStyle = fillStyle;
    context.translate( -length / 2, width * 2 - width);
    context.fillRect(0, 0, length / 2, width);

    context.translate( length / 2, width * 2 - width / 4);

    startAngle = -(Math.PI / 180) * 90;
    endAngle = -(Math.PI / 180) * 270;
    
    context.translate( length / 4, width);
    context.strokeStyle = fillStyle;
    context.beginPath();
    context.arc(0, 0, length / 2 + - width / 4, startAngle, endAngle, false);
    context.lineWidth = width;
    context.stroke();
    
    context.fillStyle = fillStyle;
    context.translate( -length / 2, - length / 2 - width / 4);
    context.fillRect(0, 0, length / 2, width);

    lastX.x = length + length * 0.3;

    context.setTransform(1,0,0,1,0,0);
}