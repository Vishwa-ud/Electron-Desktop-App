const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

function loadImage(e) {
    const file = e.target.files[0];

    if (!isFileImage(file)) {
        alertError('Please select an image file (png, jpg, jpeg)');
        return;
    }
    //get original dimensions
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = function() {
        widthInput.value = this.width;
        heightInput.value = this.height;
    };

    form.style.display = 'block';
    filename.innerText = file.name;
    outputPath.innerText = path.join(os.homedir(), 'imageresizer');
}

//send image data to main process
function sendImage(e) {
    e.preventDefault();

    const width = widthInput.value;
    const height = heightInput.value;
    const imgPath = img.files[0].path;


    if (!img.files[0]) {
        alertError('Please upload an image file');
        return;
    }

    if (width === '' || height === '') {
        alertError('Please provide both width and height');
        return;
    }

    //send data to main using ipcRenderer
    ipcRenderer.send('image-resize', {
        imgPath,
        width,
        height
    }); 
}

// chath the image done event
ipcRenderer.on('image:done', () => {
    alertSuccess(`Image resized to ${widthInput.value} x ${heightInput.value} successfully!`);
    form.reset();
    form.style.display = 'none';
});

//make sure the file is an image
function isFileImage(file) {
    const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
    
    return file && acceptedImageTypes.includes(file['type']);

}

function alertSuccess(message) {
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: 'green',
            color: 'white',
            textAlign: 'center',
        },
    });
}


function alertError(message) {
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: 'red',
            color: 'white',
            textAlign: 'center',
        },
    });
}

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);