// ==================== GLOBAL UTILITIES ====================
// Shared functions across all tools

// Format file size for display
function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} bytes`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    else return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Format duration for audio/video
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Download file helper
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

// ==================== IMAGE COMPRESSOR ====================
function initImageCompressor() {
    // DOM elements
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const compressBtn = document.getElementById('compress-btn');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('quality-value');
    const formatSelect = document.getElementById('format');
    const resizeSelect = document.getElementById('resize');
    const resultsSection = document.getElementById('results');
    const originalImg = document.getElementById('original-img');
    const compressedImg = document.getElementById('compressed-img');
    const originalSize = document.getElementById('original-size');
    const compressedSize = document.getElementById('compressed-size');
    const originalDimensions = document.getElementById('original-dimensions');
    const compressedDimensions = document.getElementById('compressed-dimensions');
    const savingsInfo = document.getElementById('savings');
    const downloadBtn = document.getElementById('download-btn');
    const spinner = document.getElementById('spinner');

    // State variables
    let originalImageFile = null;
    let compressedImageBlob = null;

    // Update quality display
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = `${qualitySlider.value}%`;
    });

    // File selection handlers
    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleImageSelection(e.target.files[0]);
    });

    // Drag and drop handlers
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('highlight');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('highlight');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('highlight');
        if (e.dataTransfer.files.length > 0) handleImageSelection(e.dataTransfer.files[0]);
    });

    // Handle image selection
    function handleImageSelection(file) {
        if (!file.type.match('image.*')) {
            alert('Please select an image file (JPEG, PNG, or WebP).');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('Image size exceeds 10MB limit.');
            return;
        }

        originalImageFile = file;
        compressBtn.disabled = false;

        const reader = new FileReader();
        reader.onload = (e) => {
            originalImg.src = e.target.result;
            
            const img = new Image();
            img.onload = () => {
                originalDimensions.textContent = `${img.width} × ${img.height}px`;
            };
            img.src = e.target.result;
            
            originalSize.textContent = formatFileSize(file.size);
        };
        reader.readAsDataURL(file);
    }

    // Compression handler
    compressBtn.addEventListener('click', () => {
        if (!originalImageFile) return;
        
        spinner.style.display = 'block';
        resultsSection.style.display = 'none';
        
        setTimeout(() => {
            compressImage(originalImageFile);
        }, 100);
    });

    // Image compression function
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
                
                canvas.toBlob((blob) => {
                    compressedImageBlob = blob;
                    const compressedUrl = URL.createObjectURL(blob);
                    compressedImg.src = compressedUrl;
                    
                    compressedSize.textContent = formatFileSize(blob.size);
                    compressedDimensions.textContent = `${width} × ${height}px`;
                    
                    const savings = ((file.size - blob.size) / file.size * 100).toFixed(1);
                    savingsInfo.textContent = `${savings}% smaller`;
                    
                    spinner.style.display = 'none';
                    resultsSection.style.display = 'block';
                    
                    downloadBtn.onclick = () => {
                        downloadFile(compressedUrl, `compressed.${outputFormat}`);
                    };
                }, `image/${outputFormat}`, quality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// ==================== PDF COMPRESSOR ====================
function initPDFCompressor() {
    const uploadArea = document.getElementById('pdf-upload-area');
    const fileInput = document.getElementById('pdf-file-input');
    const compressBtn = document.getElementById('pdf-compress-btn');
    const qualitySelect = document.getElementById('pdf-quality');
    const resultsSection = document.getElementById('pdf-results');
    const spinner = document.getElementById('pdf-spinner');
    
    // PDF-specific initialization
    if (!uploadArea) return; // Exit if not on PDF page
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handlePDFSelection(e.target.files[0]);
    });

    function handlePDFSelection(file) {
        if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
            alert('Please select a PDF file.');
            return;
        }
        
        if (file.size > 25 * 1024 * 1024) {
            alert('PDF size exceeds 25MB limit.');
            return;
        }
        
        compressBtn.disabled = false;
        // Actual PDF compression would go here
    }
}

// ==================== VIDEO COMPRESSOR ====================
function initVideoCompressor() {
    const uploadArea = document.getElementById('video-upload-area');
    const fileInput = document.getElementById('video-file-input');
    const compressBtn = document.getElementById('video-compress-btn');
    
    if (!uploadArea) return; // Exit if not on video page
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleVideoSelection(e.target.files[0]);
    });

    function handleVideoSelection(file) {
        if (!file.type.match('video.*')) {
            alert('Please select a video file.');
            return;
        }
        
        if (file.size > 50 * 1024 * 1024) {
            alert('Video size exceeds 50MB limit.');
            return;
        }
        
        compressBtn.disabled = false;
        // Actual video compression would go here
    }
}

// ==================== AUDIO COMPRESSOR ====================
function initAudioCompressor() {
    const uploadArea = document.getElementById('audio-upload-area');
    const fileInput = document.getElementById('audio-file-input');
    const compressBtn = document.getElementById('audio-compress-btn');
    
    if (!uploadArea) return; // Exit if not on audio page
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleAudioSelection(e.target.files[0]);
    });

    function handleAudioSelection(file) {
        if (!file.type.match('audio.*')) {
            alert('Please select an audio file.');
            return;
        }
        
        if (file.size > 25 * 1024 * 1024) {
            alert('Audio size exceeds 25MB limit.');
            return;
        }
        
        compressBtn.disabled = false;
        // Actual audio compression would go here
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Initialize the appropriate tool based on page
    if (document.getElementById('upload-area')) initImageCompressor();
    if (document.getElementById('pdf-upload-area')) initPDFCompressor();
    if (document.getElementById('video-upload-area')) initVideoCompressor();
    if (document.getElementById('audio-upload-area')) initAudioCompressor();
});
