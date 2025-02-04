window.onload = () => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    let lastX = {x : 0};

    drawU(context, lastX);
    drawK(context, lastX);
    drawV(context, lastX);
}

function drawU(context, lastX) {
    const x = 30;
    const y = 5;
    const width = 25;
    const length = 100;

    context.translate(x, y);
    context.fillStyle = "rgb(252, 1, 1)";
    context.rotate(1.57);
    context.fillRect(0, 0, length, width);
    
    context.translate(length, width);
    context.rotate(-1.57);
    context.fillRect(0, 0, length, width);

    context.translate(length, -length);
    context.rotate(1.57);
    context.fillRect(0, 0, length, width);

    context.translate(length, 0);
    context.rotate(0);
    context.fillRect(0, 0, length, width);
    
    context.translate(length, 0);
    context.rotate(1.57);
    context.fillRect(0, 0, length, width);

    lastX.x = length + 30;

    context.setTransform(1,0,0,1,0,0);
}

function drawK(context, lastX) {
    const x = 30 + lastX.x;
    const y = 5;
    const width = 25;
    const length = 100;

    context.translate(x, y);
    context.fillStyle = "rgb(252, 1, 1)";
    context.rotate(1.57);
    context.fillRect(0, 0, length, width);
    
    context.translate(length, 0);
    context.rotate(0);
    context.fillRect(0, 0, length, width);

    context.translate( (length - x + width) / 2 , 0);
    context.rotate(-0.7853);
    context.fillRect(0, 0, length * 1.4, width);

    context.rotate(-1.57);
    context.fillRect(0, 0, length * 1.2, width);

    lastX.x = length * 1.4 + length * 1.2 + 30;

    context.setTransform(1,0,0,1,0,0);
}

function drawV(context, lastX) {
    const x = 30 + lastX.x;
    const y = 5;
    const width = 25;
    const length = 100;

    context.translate(x, y);
    context.fillStyle = "rgb(252, 1, 1)";
    context.rotate(1.57);
    context.fillRect(0, 0, length, width);
    
    context.translate(length, 0);
    context.rotate(0);
    context.fillRect(0, 0, length, width);

    context.translate( length - width , 0);
    context.rotate(-1.57);
    context.fillRect(0, 0, length / 1.3, width);

    context.translate( 0 , -length * 2 + width);
    context.rotate(0);
    context.fillRect(0, 0, length / 4, width);

    context.translate( length / 4, width * 2);

    let startAngle = -(Math.PI / 180) * 90;
    let endAngle = -(Math.PI / 180) * 270;
    
    context.strokeStyle = "rgb(255, 0, 0)";
    context.beginPath();
    context.arc(0, 0, length / 2 - width / 2, startAngle, endAngle, false);
    context.lineWidth = width;
    context.stroke();

    context.fillStyle = "rgb(255, 0, 0)";
    context.translate( -length / 2, width * 2 - width);
    context.rotate(0);
    context.fillRect(0, 0, length / 2, width);

    context.fillStyle = "rgb(10, 9, 9)";
    context.translate( length / 2, width * 2);
    context.rotate(0);
    context.fillRect(0, 0, length / 8, width);

    startAngle = -(Math.PI / 180) * 90;
    endAngle = -(Math.PI / 180) * 270;
    
    context.translate( length / 4, width);
    context.strokeStyle = "rgb(255, 0, 0)";
    context.beginPath();
    context.arc(0, 0, length / 2 + - width / 4, startAngle, endAngle, false);
    context.lineWidth = width;
    context.stroke();
    
    lastX.x = length + 30;

    context.setTransform(1,0,0,1,0,0);
}