const y = 5;
let lastX = {x : 0};

window.onload = () => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    context.translate(canvas.width / 2, canvas.height / 2);
    drawHead(context);
    useDragAndDrop(canvas);
}

function drawHead(context)
{   
    ellipseX = 20;
    ellipseY = 17;
    radiusHead = 60;
    context.beginPath();
    context.ellipse(0, 0, radiusHead, radiusHead, -Math.PI / 3, 0, 2 * Math.PI);
    context.fillStyle="rgb(255, 255, 255)";
    context.fill();
    context.stroke();
    context.beginPath();
    context.ellipse(ellipseY, 0, ellipseX, ellipseY, Math.PI / 3, 0, 2 * Math.PI);
    context.fillStyle="rgb(255, 255, 255)";
    context.fill();
    context.stroke();
    context.beginPath();
    context.ellipse(-ellipseY, 0, ellipseX, ellipseY, -Math.PI / 3, 0, 2 * Math.PI);
    context.fillStyle="rgb(255, 255, 255)";
    context.fill();
    context.stroke();
    context.beginPath();
    context.fillStyle="rgb(47, 0, 255)";
    context.arc(0, 0, radiusHead, getRadians(180), getRadians(360));
    context.fill();   
}

function useDragAndDrop(element)
{
    var isDragging = false;
    var offsetX, offsetY;

    element.addEventListener("mousedown", function(e) {
        isDragging = true;
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
    });

    element.addEventListener("mouseup", function() {
        isDragging = false;
    });

    element.addEventListener("mousemove", function(e) {
        if (isDragging) {
            var x = e.clientX - offsetX;
            var y = e.clientY - offsetY;

            element.style.left = x + "px";
            element.style.top = y + "px";
        }
    });
}

function getRadians(degrees) {
	return (Math.PI / 180) * degrees;
}