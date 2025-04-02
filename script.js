const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload-button');
const fileNameDisplay = document.getElementById('file-name');
const compressButton = document.getElementById('compress-button');
const compressionResults = document.getElementById('compression-results');
const downloadButton = document.getElementById('download-btn');
const qualitySlider = document.getElementById('quality-slider');
const qualityValueDisplay = document.querySelector('.quality-value'); // Corrected name
const advancedOptionsHeader = document.getElementById('advanced-options-header');
const advancedOptionsContent = document.getElementById('advanced-options-content');
const fileSizeInfo = document.getElementById('file-size-info');

const popup = document.getElementById('popup');
const popupTitle = document.getElementById('popup-title');
const popupText = document.getElementById('popup-text');
const popupConfirm = document.getElementById('popup-confirm');

let file;
let compressedFile;

// Utility function to format file sizes
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

if(uploadButton){
    uploadButton.addEventListener('click', () => {
        if(fileInput){
            fileInput.click();
        }
    });
}


if(fileInput){
    fileInput.addEventListener('change', (event) => {
        file = event.target.files[0];
        if (file) {
            fileNameDisplay.textContent = `Selected File: ${file.name}`;
            if(compressButton){
                compressButton.disabled = false;
                compressButton.textContent = 'Compress Audio';
            }
            if(compressionResults){
                compressionResults.style.display = 'none';
            }
            if(downloadButton){
                downloadButton.classList.add('hidden');
            }

        } else {
            fileNameDisplay.textContent = '';
            if(compressButton){
                compressButton.disabled = true;
                compressButton.textContent = 'Compress Audio';
            }
        }
    });
}


if(qualitySlider){
    qualitySlider.addEventListener('input', (event) => {
        const quality = event.target.value;
        let qualityText = 'Low';
        if (quality > 70) {
            qualityText = 'High';
        } else if (quality > 30) {
            qualityText = 'Medium';
        } else {
            qualityText = 'Low';
        }
        qualityValueDisplay.textContent = `${qualityText} (${quality})`;
    });
}


if(advancedOptionsHeader){
    advancedOptionsHeader.addEventListener('click', () => {
        advancedOptionsHeader.classList.toggle('collapsed');
        if(advancedOptionsContent){
             advancedOptionsContent.classList.toggle('expanded');
        }

    });
}


if(compressButton){
    compressButton.addEventListener('click', () => {
        if (!file) {
            popupTitle.textContent = "No File Selected";
            popupText.textContent = "Please choose an audio file to compress.";
            popup.style.display = "flex";
            return;
        }

        compressButton.textContent = 'Compressing...';
        const quality = parseInt(qualitySlider.value);
        const format = document.getElementById('format-select').value;
        const bitrate = parseInt(document.getElementById('bitrate-input').value);
        const channels = parseInt(document.getElementById('channels-input').value);

        // Placeholder for compression logic
        setTimeout(() => {
            // Simulate compression
            const compressedFileSize = file.size * (quality / 100);
            const fileSizeDifference = file.size - compressedFileSize;
            const compressionPercentage = ((fileSizeDifference / file.size) * 100).toFixed(2);


            // Create a dummy compressed file
            compressedFile = new Blob(['Dummy compressed data'], { type: `audio/${format}` });
            const compressedFileName = `compressed_audio.${format}`;
            if(compressionResults){
                compressionResults.style.display = 'block';
                fileSizeInfo.textContent = `Original Size: ${formatFileSize(file.size)}, Compressed Size: ${formatFileSize(compressedFileSize)}, Size Reduction: ${compressionPercentage}%`;
            }

            if(downloadButton){
                downloadButton.classList.remove('hidden');
                downloadButton.textContent = 'Download Compressed Audio';
            }


            //Re-enable the compress button.
            compressButton.textContent = 'Compress Audio';
        }, 2000);
    });
}


if(popupConfirm){
    popupConfirm.addEventListener('click', () => {
        popup.style.display = 'none';
    });
}


if(downloadButton){
    downloadButton.addEventListener('click', () => {
        if (compressedFile) {
            const url = URL.createObjectURL(compressedFile);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'compressed_audio.mp3';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });
}

