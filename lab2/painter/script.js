document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    let isDrawing = false;

    context.lineWidth = 2;
    context.lineCap = 'round';
    context.strokeStyle = '#000';

    function startDrawing(e) 
    {
        isDrawing = true;
        draw(e);
    }

    function stopDrawing() 
    {
        isDrawing = false;
        context.beginPath();
    }

    function draw(e) 
    {
        if (!isDrawing) 
        {
            return;
        }

        context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        context.stroke();
        context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    function clearDrawing() 
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    const newButton = document.querySelector('#new-button');
    newButton.addEventListener('click', function() {
        clearDrawing();
    });

    function openImage() 
    {
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    canvas.setAttribute("width", window.getComputedStyle(wrapper).width);
                    canvas.setAttribute("height", window.getComputedStyle(wrapper).height);
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
        fileInput.click();
    }

    const openButton = document.querySelector('#open-button');
    openButton.addEventListener('click', openImage);

    function saveImage(format) 
    {
        const dataURL = canvas.toDataURL(`image/${format}`);
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = `drawing.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    const selectElem = document.getElementById('save-button');
    selectElem.addEventListener('change', function(){
        const selectedItem = this.value;
        if (selectedItem == 'Save')
        {
            return;
        }
        saveImage(selectedItem);
    });

    const colorPicker = document.getElementById('colorPicker');
    colorPicker.addEventListener('input', function () {
        context.strokeStyle = colorPicker.value;
    });
});
