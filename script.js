document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle functionality
  const hamburgerBtn = document.getElementById('hamburger-button'); //changed Id
  const mobileNav = document.getElementById('mobile-nav');

  if (hamburgerBtn && mobileNav) { // Check if elements exist
    hamburgerBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });

    // Close menu when a link is clicked (optional)
    const mobileNavLinks = mobileNav.querySelectorAll('a');
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
      });
    });

    // Close menu when clicking outside (optional)
    document.addEventListener('click', (event) => {
      if (!mobileNav.contains(event.target) && !hamburgerBtn.contains(event.target)) {
        mobileNav.classList.remove('open');
      }
    });
  }
  //image compressor
  const imageInput = document.getElementById('imageInput');
  const qualitySlider = document.getElementById('qualitySlider');
  const qualityValue = document.getElementById('qualityValue');
  const formatSelect = document.getElementById('formatSelect');
  const resizeSelect = document.getElementById('resizeSelect');
  const compressButton = document.getElementById('compressButton');
  const imageSpinner = document.getElementById('imageSpinner');
  const imageResults = document.getElementById('imageResults');
  const originalImageDisplay = document.getElementById('originalImage');
  const compressedImageDisplay = document.getElementById('compressedImage');
  const originalSizeDisplay = document.getElementById('originalSize');
  const compressedSizeDisplay = document.getElementById('compressedSize');
  const timeTakenDisplay = document.getElementById('timeTaken');
  const compressionRateDisplay = document.getElementById('compressionRate');
  const downloadLink = document.getElementById('downloadLink');
  const dropArea = document.querySelector('.drop-area');

  let originalFile;

  // Update quality value display
  const qualitySlider = document.getElementById('qualitySlider'); // Get the element
const qualityValue = document.getElementById('qualityValue');

if (qualitySlider) { // Check if the element exists
    qualitySlider.addEventListener('input', () => { // *Only* add the listener if it exists
        qualityValue.textContent = qualitySlider.value;
    });
}

  // Handle file drop
  dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('highlight');
  });

  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('highlight');
  });

  dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('highlight');
    handleFile(e.dataTransfer.files[0]);
  });

  // Handle file input change
  imageInput.addEventListener('change', (e) => {
    handleFile(e.target.files[0]);
  });

  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    originalFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      originalImageDisplay.src = e.target.result;
      originalSizeDisplay.textContent = formatFileSize(file.size);
      imageResults.style.display = 'none'; // Hide previous results
    };
    reader.readAsDataURL(file);
  }

  // Compress image
  compressButton.addEventListener('click', async () => {
    if (!originalFile) {
      alert('Please select an image to compress.');
      return;
    }

    imageSpinner.style.display = 'block';
    compressButton.disabled = true;
    const startTime = performance.now();

    try {
      const quality = parseInt(qualitySlider.value, 10);
      const format = formatSelect.value;
      const resize = resizeSelect.value;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = originalImageDisplay.src;

      await new Promise(resolve => img.onload = resolve);

      let targetWidth = img.width;
      let targetHeight = img.height;

      if (resize !== 'none') {
        targetWidth = parseInt(resize, 10);
        targetHeight = (targetWidth / img.width) * img.height;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const mimeType =
        format === 'jpeg' ? 'image/jpeg' :
        format === 'png' ? 'image/png' :
        format === 'webp' ? 'image/webp' :
        'image/jpeg'; // Default to JPEG

      const compressedDataUrl = canvas.toDataURL(mimeType, quality / 100);
      const compressedFile = dataURLtoFile(compressedDataUrl, `compressed_image.${format === 'auto' ? 'jpg' : format}`);

      const endTime = performance.now();
      const timeTaken = (endTime - startTime).toFixed(2);

      compressedImageDisplay.src = compressedDataUrl;
      compressedSizeDisplay.textContent = formatFileSize(compressedFile.size);
      timeTakenDisplay.textContent = `${timeTaken} ms`;

      const originalSizeInBytes = originalFile.size;
      const compressedSizeInBytes = compressedFile.size;
      const compressionRate =
        originalSizeInBytes > 0 ? ((originalSizeInBytes - compressedSizeInBytes) / originalSizeInBytes) * 100 : 0;
      compressionRateDisplay.textContent = `${compressionRate.toFixed(2)}%`;

      downloadLink.href = compressedDataUrl;
      downloadLink.download = `compressed_image.${format === 'auto' ? 'jpg' : format}`;
      downloadLink.style.display = 'inline-block';
      imageResults.style.display = 'block';

    } catch (error) {
      console.error('Compression failed:', error);
      alert('Image compression failed. Please try again.');
    } finally {
      imageSpinner.style.display = 'none';
      compressButton.disabled = false;
    }
  });

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function dataURLtoFile(dataurl, filename) {
    let arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {
      type: mime
    });
  }


  //pdf compressor

  const pdfInput = document.getElementById('pdfInput');
  const pdfQualitySelect = document.getElementById('pdfQuality');
  const pdfCompressBtn = document.getElementById('pdfCompressBtn');
  const pdfSpinner = document.getElementById('pdfSpinner');
  const pdfResults = document.getElementById('pdfResults');
  const pdfOriginalSizeDisplay = document.getElementById('pdfOriginalSize');
  const pdfCompressedSizeDisplay = document.getElementById('pdfCompressedSize');
  const pdfTimeTakenDisplay = document.getElementById('pdfTimeTaken');
  const pdfCompressionRateDisplay = document.getElementById('pdfCompressionRate');
  const pdfDownloadLink = document.getElementById('pdfDownloadLink');
  const pdfDropArea = document.querySelector('#pdf-upload-area .drop-area');

  let originalPdfFile;

  // Handle file drop for PDF
  pdfDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    pdfDropArea.classList.add('highlight');
  });

  pdfDropArea.addEventListener('dragleave', () => {
    pdfDropArea.classList.remove('highlight');
  });

  pdfDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    pdfDropArea.classList.remove('highlight');
    handlePdfFile(e.dataTransfer.files[0]);
  });

  // Handle file input change for PDF
  pdfInput.addEventListener('change', (e) => {
    handlePdfFile(e.target.files[0]);
  });

  function handlePdfFile(file) {
    if (file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      alert('File size exceeds 200MB limit.');
      return;
    }

    originalPdfFile = file;
    pdfResults.style.display = 'none'; // Hide previous results
    pdfOriginalSizeDisplay.textContent = formatFileSize(file.size);
  }



  // Compress PDF
  pdfCompressBtn.addEventListener('click', async () => {
    if (!originalPdfFile) {
      alert('Please select a PDF file to compress.');
      return;
    }

    pdfSpinner.style.display = 'block';
    pdfCompressBtn.disabled = true;
    const startTime = performance.now();

    const quality = pdfQualitySelect.value;
    const formData = new FormData();
    formData.append('file', originalPdfFile);
    formData.append('quality', quality);

    try {
      const response = await fetch('/compress-pdf', { //change this to  https://cloudconvert.com/api/v2/jobs
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const endTime = performance.now();
      const timeTaken = (endTime - startTime).toFixed(2);

      pdfCompressedSizeDisplay.textContent = formatFileSize(data.compressedSize);
      pdfTimeTakenDisplay.textContent = `${timeTaken} ms`;

      const originalSizeInBytes = originalPdfFile.size;
      const compressedSizeInBytes = data.compressedSize;
      const compressionRate = originalSizeInBytes > 0 ?
        ((originalSizeInBytes - compressedSizeInBytes) / originalSizeInBytes) * 100 : 0;
      pdfCompressionRateDisplay.textContent = `${compressionRate.toFixed(2)}%`;



      pdfDownloadLink.href = data.downloadUrl;
      pdfDownloadLink.style.display = 'inline-block';
      pdfResults.style.display = 'block';

    } catch (error) {
      console.error('Compression failed:', error);
      alert('PDF compression failed. Please try again.');
    } finally {
      pdfSpinner.style.display = 'none';
      pdfCompressBtn.disabled = false;
    }
  });
});
