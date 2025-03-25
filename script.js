// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

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

// Variables to store image data
let originalImageFile = null;
let compressedImageBlob = null;

// Update quality value display
qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = `${qualitySlider.value}%`;
});

// Handle file selection
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleImageSelection(e.target.files[0]);
    }
});

// Handle drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.backgroundColor = 'rgba(66, 133, 244, 0.2)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.backgroundColor = 'rgba(66, 133, 244, 0.05)';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.backgroundColor = 'rgba(66, 133, 244, 0.05)';
    
    if (e.dataTransfer.files.length > 0) {
        handleImageSelection(e.dataTransfer.files[0]);
    }
});

// Handle image selection
function handleImageSelection(file) {
    // Check if file is an image
    if (!file.type.match('image.*')) {
        alert('Please select an image file (JPEG, PNG, or WebP).');
        return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('Image size exceeds 10MB limit. Please choose a smaller image.');
        return;
    }
    
    originalImageFile = file;
    compressBtn.disabled = false;
    
    // Display original image
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImg.src = e.target.result;
        
        // Get image dimensions
        const img = new Image();
        img.onload = () => {
            originalDimensions.textContent = `${img.width} × ${img.height}px`;
        };
        img.src = e.target.result;
        
        // Display original size
        originalSize.textContent = formatFileSize(file.size);
    };
    reader.readAsDataURL(file);
}

// Compress image when button is clicked
compressBtn.addEventListener('click', () => {
    if (!originalImageFile) return;
    
    // Show loading spinner
    spinner.style.display = 'block';
    resultsSection.style.display = 'none';
    
    // Use setTimeout to allow UI to update before compression starts
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
            // Calculate new dimensions if resizing
            let width = img.width;
            let height = img.height;
            
            if (maxWidth && img.width > maxWidth) {
                width = maxWidth;
                height = (img.height * maxWidth) / img.width;
            }
            
            // Create canvas for compression
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to blob with specified quality
            canvas.toBlob((blob) => {
                compressedImageBlob = blob;
                
                // Display compressed image
                const compressedUrl = URL.createObjectURL(blob);
                compressedImg.src = compressedUrl;
                
                // Update UI with compressed image info
                compressedSize.textContent = formatFileSize(blob.size);
                compressedDimensions.textContent = `${width} × ${height}px`;
                
                // Calculate savings
                const savings = ((file.size - blob.size) / file.size * 100).toFixed(1);
                savingsInfo.textContent = `${savings}% smaller`;
                
                // Hide spinner and show results
                spinner.style.display = 'none';
                resultsSection.style.display = 'block';
                
                // Enable download button
                downloadBtn.onclick = () => {
                    downloadImage(compressedUrl, `compressed.${outputFormat}`);
                };
                
            }, `image/${outputFormat}`, quality);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Download compressed image
function downloadImage(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Format file size for display
function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} bytes`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    else return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}