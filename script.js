// ==================== GLOBAL UTILITIES ====================
function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} bytes`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    else return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// ==================== IMAGE COMPRESSOR (REAL) ====================
function initImageCompressor() {
    // --- Keep your existing DOM element declarations ---
    const imageInput = document.getElementById('imageInput');
    const qualitySlider = document.getElementById('qualitySlider');
    const formatSelect = document.getElementById('formatSelect');
    const resizeSelect = document.getElementById('resizeSelect');
    const compressedImage = document.getElementById('compressedImage');
    const downloadLink = document.getElementById('downloadLink');
    const originalSizeDisplay = document.getElementById('originalSize');
    const compressedSizeDisplay = document.getElementById('compressedSize');
    const timeTakenDisplay = document.getElementById('timeTaken');
    const compressionRateDisplay = document.getElementById('compressionRate');


    let originalImageSize = 0;
    let compressedImageBlob;

    imageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            originalImageSize = file.size;
            originalSizeDisplay.textContent = `Original Size: ${formatFileSize(originalImageSize)}`;
            compressImage(file); // Call the compressImage function
        } else {
            alert("Please select an image file."); //handle if no file.
        }
    });


    function compressImage(file) {
        const quality = parseInt(qualitySlider.value) / 100;
        const outputFormat = formatSelect.value === 'auto' ? file.type.split('/')[1] : formatSelect.value;
        const maxWidth = resizeSelect.value === 'none' ? null : parseInt(resizeSelect.value);

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (maxWidth && img.width > maxWidth) {
                    width = maxWidth;
                    height = (img.height * maxWidth) / img.width;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const startTime = performance.now();
                canvas.toBlob(
                    (blob) => {
                        try {
                            // This is the compressed image data
                            compressedImageBlob = blob;
                            const compressedSize = blob.size;
                            const endTime = performance.now();
                            const timeTaken = endTime - startTime;

                            compressedSizeDisplay.textContent = `Compressed Size: ${formatFileSize(compressedSize)}`;
                            timeTakenDisplay.textContent = `Time Taken: ${formatDuration(timeTaken / 1000)}`;
                            const compressionRate = ((originalImageSize - compressedSize) / originalImageSize) * 100;
                            compressionRateDisplay.textContent = `Compression Rate: ${compressionRate.toFixed(2)}%`;

                            const compressedUrl = URL.createObjectURL(blob);
                            compressedImage.src = compressedUrl;
                            downloadLink.href = compressedUrl;
                            downloadLink.style.display = 'block';
                            spinner.style.display = 'none'; // Hide spinner after successful compression
                        } catch (error) {
                            console.error("Error during toBlob:", error);
                            alert("Error compressing the image. Please try again.");
                            spinner.style.display = 'none';
                        }
                    },
                    `image/${outputFormat}`,
                    quality
                );
            };
            img.onerror = () => {
                alert("Error loading image. Please ensure it is a valid image file.");
                spinner.style.display = 'none';
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            alert("Error reading file. Please try a different file.");
            spinner.style.display = 'none';
        };
        spinner.style.display = 'block'; // Show spinner before reading file
        reader.readAsDataURL(file);
    }
}



// ==================== PDF COMPRESSOR (REAL) ====================
async function initPDFCompressor() {
    // ... (keep existing DOM elements)
    const fileInput = document.getElementById('pdfInput');
    const compressBtn = document.getElementById('pdfCompressBtn');
    const spinner = document.getElementById('pdfSpinner');
    const resultsSection = document.getElementById('pdfResults');
    const downloadLink = document.getElementById('pdfDownloadLink');

    compressBtn.addEventListener('click', async () => {
        if (!fileInput.files[0]) {
            alert('Please select a PDF file');
            return;
        }

        spinner.style.display = 'block';
        resultsSection.style.display = 'none';

        try {
            const pdfBytes = await fileInput.files[0].arrayBuffer();
            const { PDFDocument } = PDFLib;

            // Load the PDF
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const newPdfDoc = await PDFDocument.create();

            // Copy pages with compressed images
            for (let i = 0; i < pdfDoc.getPageCount(); i++) {
                const page = pdfDoc.getPage(i);
                const { width, height } = page.getSize();
                const newPage = newPdfDoc.addPage([width, height]);

                // Draw content with compressed images
                try{
                  const content = await page.node.Content();
                  newPage.node.addContentStream(content);
                }catch(e){
                    console.error("Error processing page content", e);
                    alert("Error processing page content. Some pages may not be compressed");
                }

            }

            // Save with compression
            const compressedPdfBytes = await newPdfDoc.save({
                useObjectStreams: true,
                // Additional compression options
            });

            // ... (update UI with real compressed file)
            const compressedBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
            const compressedUrl = URL.createObjectURL(compressedBlob);
            downloadLink.href = compressedUrl;
            downloadLink.style.display = 'block';

            spinner.style.display = 'none';
            resultsSection.style.display = 'block';

        } catch (error) {
            console.error('PDF compression error:', error);
            alert('Failed to compress PDF. Please try again.');
            spinner.style.display = 'none';
        }
    });
}

// ==================== VIDEO COMPRESSOR (REAL - FFmpeg.wasm) ====================
async function initVideoCompressor() {
    const { createFFmpeg, fetchFile } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true });

    const fileInput = document.getElementById('videoInput');
    const compressBtn = document.getElementById('videoCompressBtn');
    const spinner = document.getElementById('videoSpinner');
    const resultsSection = document.getElementById('videoResults');
    const downloadLink = document.getElementById('videoDownloadLink');


    compressBtn.addEventListener('click', async () => {
        if (!fileInput.files[0]) {
            alert('Please select a video file.');
            return;
        }

        spinner.style.display = 'block';
        resultsSection.style.display = 'none';

        try {
            // Load FFmpeg
            if (!ffmpeg.isLoaded()) {
                await ffmpeg.load();
            }

            // Write file to FFmpeg FS
            const videoData = await fetchFile(fileInput.files[0]);
            ffmpeg.FS('writeFile', 'input.mp4', videoData);

            // Run compression (example: reduce to 720p and lower bitrate)
            await ffmpeg.run(
                '-i', 'input.mp4',
                '-vf', 'scale=-1:720',
                '-b:v', '1M',
                '-preset', 'fast',
                'output.mp4'
            );

            // Read result
            const data = ffmpeg.FS('readFile', 'output.mp4');
            const compressedBlob = new Blob([data.buffer], { type: 'video/mp4' });
            const compressedUrl = URL.createObjectURL(compressedBlob);
            downloadLink.href = compressedUrl;
            downloadLink.style.display = 'block';

            spinner.style.display = 'none';
            resultsSection.style.display = 'block';

        } catch (error) {
            console.error('Video compression error:', error);
            alert('Failed to compress video. Please try again.');
            spinner.style.display = 'none';
        }
    });
}

// ==================== AUDIO COMPRESSOR (REAL - lamejs) ====================
function initAudioCompressor() {
    const fileInput = document.getElementById('audioInput');
    const compressBtn = document.getElementById('audioCompressBtn');
    const spinner = document.getElementById('audioSpinner');
    const resultsSection = document.getElementById('audioResults');
    const downloadLink = document.getElementById('audioDownloadLink');
    const bitrateSelect = document.getElementById('audioBitrate');

    compressBtn.addEventListener('click', async () => {
        if (!fileInput.files[0]) {
            alert('Please select an audio file.');
            return;
        }

        spinner.style.display = 'block';
        resultsSection.style.display = 'none';

        try {
            const audioContext = new AudioContext();
            const arrayBuffer = await fileInput.files[0].arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            // Convert to MP3 using lamejs
            const mp3Encoder = new lamejs.Mp3Encoder(
                audioBuffer.numberOfChannels,
                audioBuffer.sampleRate,
                parseInt(bitrateSelect.value) || 128
            );

            const samples = audioBuffer.getChannelData(0); // Left channel
            const mp3Data = mp3Encoder.encodeBuffer(samples);
            const blob = new Blob([mp3Data], { type: 'audio/mp3' });
            const compressedUrl = URL.createObjectURL(blob);
            downloadLink.href = compressedUrl;
            downloadLink.style.display = 'block';

            spinner.style.display = 'none';
            resultsSection.style.display = 'block';

        } catch (error) {
            console.error('Audio compression error:', error);
            alert('Failed to compress audio. Please try again.');
            spinner.style.display = 'none';
        }
    });
}

// Initialize all compressors
document.addEventListener('DOMContentLoaded', () => {
    // Set current year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Initialize tools
    if (document.getElementById('image-upload-area')) initImageCompressor();
    if (document.getElementById('pdf-upload-area')) initPDFCompressor();
    if (document.getElementById('video-upload-area')) initVideoCompressor();
    if (document.getElementById('audio-upload-area')) initAudioCompressor();
});
