document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const button = document.getElementById('buttons-container');

    function openImage() 
    {   
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    canvas.width = 1280;
                    canvas.height = 720;
                    if (!(this.width > canvas.width)){
                        canvas.width = this.width;   
                    }
                    if (!(this.height > canvas.height)){
                        canvas.height = this.height;   
                    }
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
        fileInput.click();
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

    const openButton = document.querySelector('#open-button');
    openButton.addEventListener('click', openImage);
    useDragAndDrop(canvas);

});

