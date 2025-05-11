const y = 5;

window.onload = () => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    context.translate(canvas.width / 2, canvas.height / 2);
    draw(context);
    useDragAndDrop(canvas);
}

//TODO: избавиться от глобальных перменных, разделить функцию, устранить дублирование баллов
function draw(context)
{   
    ellipseX = 20;
    ellipseY = 17;
    radiusHead = 60;

    context.beginPath();
    context.fillStyle="rgb(27, 1, 144)";
    context.arc(0, 0, radiusHead, getRadians(180), getRadians(360));
    context.fill();

    context.beginPath();
    context.fillStyle="rgb(255, 255, 255)";
    context.ellipse(0, radiusHead / 2, radiusHead * 2, radiusHead, 0, 0, 2 * Math.PI);
    context.fill(); 

    context.beginPath();
    context.fillStyle="rgb(255, 0, 0)";
    context.ellipse(0, radiusHead / 2, radiusHead * 2, radiusHead, 0, 0, 2 * Math.PI);
    context.fill();

    context.beginPath();
    context.fillStyle="rgb(255, 255, 255)";
    context.ellipse(0, radiusHead/ 1.5, radiusHead * 2, radiusHead, 0, 0, 2 * Math.PI);
    context.fill();

    context.fillStyle="rgb(255, 255, 255)";
    context.fillRect(radiusHead, -radiusHead, canvas.width, canvas.height);
    context.fillStyle="rgb(255, 255, 255)";
    context.fillRect(-radiusHead*2, -radiusHead, radiusHead, canvas.height);

    
    context.fillStyle="rgb(27, 1, 144)";
    context.fillRect(0, radiusHead * 1.7, radiusHead / 1.2, radiusHead / 4);

    context.fillStyle="rgb(27, 1, 144)";
    context.fillRect(-radiusHead/1.2, radiusHead * 1.7, radiusHead / 1.2, radiusHead / 4);

    context.beginPath();
    context.fillStyle="rgb(168, 85, 2)";
    context.ellipse(radiusHead / 1.4, radiusHead, radiusHead / 2, ellipseY / 3, getRadians(240), 0, Math.PI);
    context.ellipse(0, radiusHead * 1.7, radiusHead * 0.8, ellipseY / 2, getRadians(360), 0, Math.PI);
    context.ellipse(-radiusHead / 1.4, radiusHead, radiusHead / 2, ellipseY / 3, getRadians(-240), 0, Math.PI);

    context.fill();

    context.beginPath();
    context.arc(-radiusHead / 10, radiusHead * 1.2, radiusHead / 20, getRadians(-12), getRadians(192), 0, Math.PI * 1.2);
    context.fillStyle="rgb(0, 0, 0)";
    context.fill();  

    context.beginPath();
    context.arc(-radiusHead / 10, radiusHead * 1.4, radiusHead / 20, getRadians(-12), getRadians(192), 0, Math.PI * 1.2);
    context.fillStyle="rgb(0, 0, 0)";
    context.fill();  

    context.beginPath();
    context.arc(-radiusHead / 10, radiusHead * 1.6, radiusHead / 20, getRadians(-12), getRadians(192), 0, Math.PI * 1.2);
    context.fillStyle="rgb(0, 0, 0)";
    context.fill();  

    context.beginPath();
    context.arc(0, 0, radiusHead, getRadians(-12), getRadians(192), 0, Math.PI * 1.2);
    context.fillStyle="rgb(251, 210, 145)";
    context.fill();  

    context.beginPath();
    context.ellipse(0, - radiusHead / 5.5, radiusHead, radiusHead / 5, 0, 0, 2 * Math.PI);
    context.fillStyle="rgb(251, 210, 145)";
    context.fill();  
    
    context.beginPath();
    context.ellipse(ellipseY, 0, ellipseX, ellipseY, Math.PI / 3, 0, 2 * Math.PI);
    context.fillStyle="rgb(255, 255, 255)";
    context.fill();

    context.beginPath();
    context.ellipse(-ellipseY, 0, ellipseX, ellipseY, -Math.PI / 3, 0, 2 * Math.PI);
    context.fillStyle="rgb(255, 255, 255)";
    context.fill();

    context.beginPath();
    context.arc(-ellipseY / 2, 0, 2, getRadians(0), getRadians(360), 0, Math.PI * 1.2);
    context.fillStyle="rgb(0, 0, 0)";
    context.fill();  

    context.beginPath();
    context.arc(ellipseY / 2, 0, 2, getRadians(0), getRadians(360), 0, Math.PI * 1.2);
    context.fillStyle="rgb(0, 0, 0)";
    context.fill();  

    context.beginPath();
    context.ellipse(0, radiusHead / 1.5, ellipseX / 2, ellipseY / 5, 0, 0, Math.PI);
    context.fillStyle="rgb(0, 0, 0)";
    context.stroke();  
    
    context.beginPath();
    context.arc(0, -radiusHead, radiusHead / 5, getRadians(0), getRadians(360), 0, 0);
    context.fillStyle="rgb(255, 0, 0)";
    context.fill();  

    context.beginPath();
    context.moveTo(-radiusHead / 1.4, radiusHead * 1.5);
    context.lineTo(-radiusHead / 2, radiusHead);
    context.stroke(); 

    context.beginPath();
    context.moveTo(radiusHead / 1.4, radiusHead * 1.5);
    context.lineTo(radiusHead / 2, radiusHead);
    context.stroke(); 

    context.beginPath();
    context.moveTo(0, radiusHead);
    context.lineTo(0, radiusHead * 1.83);
    context.stroke(); 

    context.beginPath();
    context.arc(-radiusHead / 1.2, radiusHead * 1.5, radiusHead / 4, getRadians(0), getRadians(360), 0, 0);
    context.fillStyle="rgb(255, 0, 0)";
    context.fill();  

    context.beginPath();
    context.arc(radiusHead / 1.2, radiusHead * 1.5, radiusHead / 4, getRadians(0), getRadians(360), 0, 0);
    context.fillStyle="rgb(255, 0, 0)";
    context.fill(); 

    context.beginPath();
    context.ellipse(-radiusHead / 2.2, radiusHead * 2, ellipseX * 1.2, ellipseY / 3, getRadians(180), 0, Math.PI);
    context.fillStyle="rgb(0, 0, 0)";
    context.fill();

    context.beginPath();
    context.ellipse(radiusHead / 2.2, radiusHead * 2, ellipseX * 1.2, ellipseY / 3, getRadians(180), 0, Math.PI);
    context.fillStyle="rgb(0, 0, 0)";
    context.fill();

}

function useDragAndDrop(element)
{
    let isDragging = false;
    let offsetX, offsetY;

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
            let x = e.clientX - offsetX;
            let y = e.clientY - offsetY;

            element.style.left = x + "px";
            element.style.top = y + "px";
        }
    });
}

function getRadians(degrees) {
	return (Math.PI / 180) * degrees;
}

//TODO: отдельный класс для персонажа