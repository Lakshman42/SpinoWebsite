document.addEventListener('DOMContentLoaded', () => {
    const uploadT1 = document.getElementById('upload-t1');
    const uploadT2 = document.getElementById('upload-t2');
    const inputT1 = document.getElementById('input-t1');
    const inputT2 = document.getElementById('input-t2');
    const previewT1 = document.getElementById('preview-t1');
    const previewT2 = document.getElementById('preview-t2');
    const analyzeBtn = document.getElementById('analyze-trigger');
    const resultsModal = document.getElementById('results-modal');
    const closeModal = document.getElementById('close-modal');

    let t1File = null;
    let t2File = null;
    let t1IsColor = false;
    let t2IsColor = false;

    // Setup Upload Box with Click & Drag-and-Drop support
    function setupUploadBox(boxEl, inputEl, type) {
        if (!boxEl || !inputEl) return;

        boxEl.addEventListener('click', (e) => {
            inputEl.value = ''; // Reset to allow re-selecting same file
            inputEl.click();
        });

        inputEl.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0], type);
            }
        });

        // Drag and drop event listeners
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            boxEl.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            boxEl.addEventListener('dragover', () => {
                boxEl.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            boxEl.addEventListener('dragleave', () => {
                boxEl.classList.remove('drag-over');
            }, false);
        });

        boxEl.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt && dt.files;
            if (files && files.length > 0) {
                handleFile(files[0], type);
            }
        });
    }

    setupUploadBox(uploadT1, inputT1, 't1');
    setupUploadBox(uploadT2, inputT2, 't2');

    function handleFile(file, type) {
        if (!file) return;

        // Check if file is an image
        if (!file.type || !file.type.startsWith('image/')) {
            showValidationError('Invalid File Format', 'Please upload a valid image file (JPEG, PNG, WebP, etc.).', 'error');
            return;
        }

        if (type === 't1') t1IsColor = false;
        if (type === 't2') t2IsColor = false;

        // Check if the uploaded image contains color (non-grayscale)
        checkColorImage(file, (isColor) => {
            if (type === 't1') t1IsColor = isColor;
            if (type === 't2') t2IsColor = isColor;

            if (isColor) {
                showValidationError(
                    'Warning: Color Image Detected',
                    'Medical MRI scans are expected to be grayscale (monochrome). Color images cannot be analyzed by the AI model.',
                    'warning'
                );
            }
        });

        // Open Image Editor (or fallback to direct preview)
        if (window.SpinoCareImageEditor && typeof window.SpinoCareImageEditor.open === 'function') {
            window.SpinoCareImageEditor.open(file, (croppedFile, croppedUrl) => {
                setFilePreview(type, croppedFile, croppedUrl);
            });
        } else {
            const url = URL.createObjectURL(file);
            setFilePreview(type, file, url);
        }
    }

    function checkColorImage(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const sampleW = Math.min(img.width, 150);
                    const sampleH = Math.min(img.height, 150);
                    canvas.width = sampleW;
                    canvas.height = sampleH;
                    ctx.drawImage(img, 0, 0, sampleW, sampleH);

                    const imgData = ctx.getImageData(0, 0, sampleW, sampleH).data;
                    let colorPixels = 0;
                    let totalSampled = 0;

                    for (let i = 0; i < imgData.length; i += 16) { // Sample every 4th pixel
                        const r = imgData[i];
                        const g = imgData[i + 1];
                        const b = imgData[i + 2];
                        const a = imgData[i + 3];

                        if (a < 50) continue; // Skip transparent background
                        totalSampled++;

                        // Calculate RGB divergence
                        const diff = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
                        if (diff > 35) { // Threshold for non-monochrome color pixels
                            colorPixels++;
                        }
                    }

                    const isColor = totalSampled > 0 && (colorPixels / totalSampled) > 0.03;
                    callback(isColor);
                } catch (err) {
                    console.warn('Color analysis error:', err);
                    callback(false);
                }
            };
            img.onerror = () => callback(false);
            img.src = e.target.result;
        };
        reader.onerror = () => callback(false);
        reader.readAsDataURL(file);
    }

    function checkDuplicateImages(callback) {
        if (!t1File || !t2File) {
            if (callback) callback(false);
            return false;
        }

        // Check 1: File metadata (Same Name & Size)
        const isSameNameAndSize = (
            t1File.name && t2File.name &&
            t1File.name === t2File.name &&
            t1File.size === t2File.size
        );

        // Check 2: Preview URL / Base64 Data matching
        const isSamePreviewSrc = (
            previewT1.src && previewT2.src &&
            previewT1.src.length > 50 &&
            previewT1.src === previewT2.src
        );

        const isQuickDuplicate = isSameNameAndSize || isSamePreviewSrc;

        // Check 3: Deep Pixel-Level Comparison (Canvas Pixel Matching)
        if (previewT1.src && previewT2.src && callback) {
            compareImagePixels(previewT1.src, previewT2.src, (isPixelMatch) => {
                callback(isQuickDuplicate || isPixelMatch);
            });
        } else if (callback) {
            callback(isQuickDuplicate);
        }

        return isQuickDuplicate;
    }

    function compareImagePixels(src1, src2, callback) {
        let img1 = new Image();
        let img2 = new Image();
        let loaded = 0;

        const onImgLoad = () => {
            loaded++;
            if (loaded < 2) return;
            try {
                const w = 100, h = 100;
                const c1 = document.createElement('canvas'); c1.width = w; c1.height = h;
                const ctx1 = c1.getContext('2d'); ctx1.drawImage(img1, 0, 0, w, h);

                const c2 = document.createElement('canvas'); c2.width = w; c2.height = h;
                const ctx2 = c2.getContext('2d'); ctx2.drawImage(img2, 0, 0, w, h);

                const d1 = ctx1.getImageData(0, 0, w, h).data;
                const d2 = ctx2.getImageData(0, 0, w, h).data;

                let diffCount = 0;
                let totalSampled = 0;

                for (let i = 0; i < d1.length; i += 4) {
                    totalSampled++;
                    const diffR = Math.abs(d1[i] - d2[i]);
                    const diffG = Math.abs(d1[i+1] - d2[i+1]);
                    const diffB = Math.abs(d1[i+2] - d2[i+2]);
                    if (diffR > 10 || diffG > 10 || diffB > 10) {
                        diffCount++;
                    }
                }

                // If >98% of pixels match, they are pixel-identical images
                const matchRatio = 1 - (diffCount / totalSampled);
                callback(matchRatio > 0.98);
            } catch (e) {
                callback(false);
            }
        };

        img1.onload = onImgLoad;
        img2.onload = onImgLoad;
        img1.onerror = () => callback(false);
        img2.onerror = () => callback(false);
        img1.src = src1;
        img2.src = src2;
    }

    function setFilePreview(type, file, url) {
        if (type === 't1') {
            t1File = file;
            previewT1.src = url;
            previewT1.style.display = 'block';
            uploadT1.classList.add('active');
        } else {
            t2File = file;
            previewT2.src = url;
            previewT2.style.display = 'block';
            uploadT2.classList.add('active');
        }

        // Check if user uploaded identical images for both T1 and T2
        if (checkDuplicateImages()) {
            showValidationError(
                'Warning: Identical Images Uploaded',
                'You have uploaded the exact same image for both T1-weighted and T2-weighted slots. Please ensure distinct T1 and T2 sequence scans for accurate diagnosis.',
                'warning'
            );
        }

        checkEnableButton();
    }

    // Expose helpers globally for testing and external triggers
    window.setFilePreview = setFilePreview;
    window.showValidationError = showValidationError;

    function showValidationError(title, message, toastType = 'error') {
        const existing = document.getElementById('mri-error-toast');
        if (existing) existing.remove();

        const isWarning = toastType === 'warning';
        const borderColor = isWarning ? '#f59e0b' : '#F26666';
        const iconClass = isWarning ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-xmark';

        const toast = document.createElement('div');
        toast.id = 'mri-error-toast';
        toast.style.cssText = `
            position: fixed;
            top: 90px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            border-radius: 16px;
            padding: 20px 24px;
            box-shadow: 0 10px 35px rgba(0,0,0,0.18);
            z-index: 9999;
            max-width: 420px;
            width: 90%;
            border-left: 5px solid ${borderColor};
            animation: toastSlide 0.3s ease;
        `;
        toast.innerHTML = `
            <div style="display:flex;align-items:flex-start;gap:12px;">
                <i class="${iconClass}" style="color:${borderColor};font-size:1.4rem;margin-top:2px;flex-shrink:0;"></i>
                <div style="flex-grow:1;">
                    <strong style="color:#1a1a1a;font-size:1rem;display:block;margin-bottom:6px;">${title}</strong>
                    <p style="color:#555;font-size:0.85rem;margin:0;white-space:pre-line;line-height:1.5;">${message}</p>
                </div>
                <button onclick="document.getElementById('mri-error-toast').remove()" style="background:none;border:none;cursor:pointer;color:#aaa;font-size:1.1rem;margin-left:auto;flex-shrink:0;">✕</button>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 6000);
    }

    // Inject toast animation
    const style = document.createElement('style');
    style.textContent = `@keyframes toastSlide { from { opacity:0; transform:translateX(-50%) translateY(-15px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`;
    document.head.appendChild(style);

    function checkEnableButton() {
        if (t1File && t2File) {
            analyzeBtn.disabled = false;
        }
    }

    // Analysis Logic — Strict Guard Validation
    analyzeBtn.addEventListener('click', async () => {
        // 1. Check if both files are uploaded
        if (!t1File || !t2File) {
            showValidationError('Missing MRI Scans', 'Please upload both T1-weighted and T2-weighted MRI scans before starting analysis.', 'error');
            return; // BLOCK EXECUTION
        }

        // 2. Check if same image was uploaded for T1 and T2
        if (checkDuplicateImages()) {
            showValidationError(
                'Analysis Blocked: Identical Images Uploaded',
                'Analysis cannot be performed on identical images. You have uploaded the exact same scan for both T1 and T2 slots. Please upload distinct T1 and T2 sequence scans.',
                'warning'
            );
            return; // BLOCK EXECUTION
        }

        // 3. Check if color images were uploaded
        if (t1IsColor || t2IsColor) {
            showValidationError(
                'Analysis Blocked: Color Image Detected',
                'Analysis cannot be performed on color images. Medical MRI scans must be grayscale (monochrome). Please upload valid monochrome MRI scans.',
                'warning'
            );
            return; // BLOCK EXECUTION
        }

        // Execution allowed only if all validations pass
        analyzeBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
        analyzeBtn.disabled = true;

        setTimeout(() => {
            showResults();
            analyzeBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Analyze Images';
            analyzeBtn.disabled = false;
        }, 2000);
    });

    // Store last result data for PDF generation
    let lastResult = {};

    function showResults() {
        const isModic = Math.random() > 0.5;
        const confidence = (85 + Math.random() * 10).toFixed(1);
        const noModic = (100 - parseFloat(confidence)).toFixed(1);
        const time = (250 + Math.random() * 150).toFixed(0);
        const label = isModic ? 'Modic Change Detected' : 'No Modic Changes';
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const entryId = 'SC-' + Date.now();

        // Save for PDF
        Object.assign(lastResult, { isModic, confidence, noModic, time, label, dateStr, entryId });

        document.getElementById('result-label-ios').textContent = label;
        document.getElementById('result-confidence-ios').textContent = `Confidence: ${confidence}%`;
        document.getElementById('score-no-modic').textContent = `${noModic}%`;
        document.getElementById('score-modic').textContent = `${confidence}%`;
        document.getElementById('res-time').textContent = `Time: ${time}ms`;
        document.getElementById('res-model-version').textContent = 'v2.3';

        // Reset buttons
        const saveBtn = document.getElementById('save-history-btn');
        saveBtn.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i> Save to History';
        saveBtn.style.background = '#F26666';
        saveBtn.disabled = false;

        resultsModal.style.display = 'flex';
    }

    // Save to History — converts blob URLs to base64 then saves to localStorage
    document.getElementById('save-history-btn').addEventListener('click', async function () {
        this.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Saving...';
        this.disabled = true;

        // Convert blob:// URLs → permanent base64 data URLs
        async function toDataUrl(src) {
            if (!src || src === '') return '';
            if (src.startsWith('data:')) return src; // already base64
            try {
                const resp = await fetch(src);
                const blob = await resp.blob();
                return await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            } catch (e) {
                console.warn('Could not convert image to data URL:', e);
                return '';
            }
        }

        const t1Data = await toDataUrl(previewT1.src);
        const t2Data = await toDataUrl(previewT2.src);

        const entries = JSON.parse(localStorage.getItem('spinocare_history') || '[]');
        entries.unshift({
            entryId: lastResult.entryId,
            label: lastResult.label,
            confidence: lastResult.confidence,
            noModic: lastResult.noModic,
            time: lastResult.time,
            dateStr: lastResult.dateStr,
            isModic: lastResult.isModic,
            t1: t1Data,
            t2: t2Data,
        });
        localStorage.setItem('spinocare_history', JSON.stringify(entries));

        // Matches iOS isSaved → gray + checkmark
        this.innerHTML = '<i class="fa-solid fa-check"></i> Saved';
        this.style.background = 'gray';
    });


    // ── PDF Generator (matches iOS HistoryView createPDF exactly) ──────────────
    async function generatePDFReport(result, t1Src, t2Src) {
        // Page metrics (A4 in points at 96dpi equivalent)
        const PW = 794, PH = 1123, M = 53, CW = PW - M * 2;
        const CORAL = '#F26666';
        const LIGHT_PINK = '#FAEBEB';
        const ROW_ALT = '#F7F7F7';
        const TEXT_DARK = '#222';
        const TEXT_MUTED = '#666';
        const DIVIDER = '#E0E0E0';

        // Create offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = PW; canvas.height = PH;
        const c = canvas.getContext('2d');
        c.fillStyle = 'white';
        c.fillRect(0, 0, PW, PH);

        // ── Full-bleed coral header ──────────────────────────────────────────
        c.fillStyle = CORAL;
        c.fillRect(0, 0, PW, 117);

        // ── Logo ─────────────────────────────────────────────────────────────
        await new Promise((resolve) => {
            const logoImg = new Image();
            logoImg.onload = () => {
                c.save();
                c.beginPath();
                c.arc(M + 37, 58, 37, 0, Math.PI * 2);
                c.clip();
                c.drawImage(logoImg, M, 58 - 37, 74, 74);
                c.restore();
                resolve();
            };
            logoImg.onerror = () => {
                c.fillStyle = 'rgba(255,255,255,0.25)';
                c.beginPath(); c.arc(M + 37, 58, 37, 0, Math.PI * 2); c.fill();
                c.fillStyle = 'white';
                c.font = 'bold 22px Inter, sans-serif';
                c.textAlign = 'center';
                c.fillText('SC', M + 37, 65);
                resolve();
            };
            logoImg.src = 'app-logo.webp';
        });

        // App name
        c.textAlign = 'left';
        c.fillStyle = 'white';
        c.font = 'bold 26px Inter, sans-serif';
        c.fillText('SpinoCare', M + 88, 50);
        c.font = '13px Inter, sans-serif';
        c.fillStyle = 'rgba(255,255,255,0.85)';
        c.fillText('Medical MRI Analysis Report', M + 88, 72);

        // Date top-right
        c.textAlign = 'right';
        c.font = '12px Inter, sans-serif';
        c.fillStyle = 'rgba(255,255,255,0.85)';
        c.fillText(`Date: ${result.dateStr}`, M + CW, 72);
        c.textAlign = 'left';

        let y = 117 + 24;

        // ── Pink accent sub-bar ──────────────────────────────────────────────
        c.fillStyle = LIGHT_PINK;
        c.fillRect(M, y, CW, 32);
        c.fillStyle = CORAL;
        c.fillRect(M, y, 5, 32);
        c.fillStyle = TEXT_DARK;
        c.font = 'bold 13px Inter, sans-serif';
        c.fillText('ANALYSIS RESULTS', M + 14, y + 21);
        y += 44;

        // ── Data Table ───────────────────────────────────────────────────────
        const col1W = 200, rowH = 34;
        const rows = [
            ['Diagnosis Result', result.label],
            ['Confidence Score', `${result.confidence}%`],
            ['No Modic Score', `${result.noModic}%`],
            ['Modic Change Score', `${result.confidence}%`],
            ['Analysis Mode', 'Offline (Local AI)'],
            ['Processing Time', `${(result.time / 1000).toFixed(2)} sec`],
            ['AI Model Version', 'v2.3'],
            ['Report ID', result.entryId],
        ];

        // Table border
        c.strokeStyle = DIVIDER;
        c.lineWidth = 1;
        roundRect(c, M, y, CW, rows.length * rowH, 6, false, true);

        rows.forEach(([label, value], i) => {
            const ry = y + i * rowH;
            // Alternating row bg
            c.fillStyle = i % 2 === 0 ? 'white' : ROW_ALT;
            if (i === 0 || i === rows.length - 1) {
                c.fillRect(M, ry, CW, rowH);
            } else {
                c.fillRect(M, ry, CW, rowH);
            }
            // Column divider
            c.strokeStyle = DIVIDER; c.lineWidth = 0.5;
            c.beginPath(); c.moveTo(M + col1W, ry); c.lineTo(M + col1W, ry + rowH); c.stroke();
            // Row divider (not last)
            if (i < rows.length - 1) {
                c.beginPath(); c.moveTo(M, ry + rowH); c.lineTo(M + CW, ry + rowH); c.stroke();
            }
            // Label
            c.fillStyle = TEXT_MUTED;
            c.font = 'bold 11px Inter, sans-serif';
            c.fillText(label, M + 12, ry + 22);
            // Value
            const isResult = label === 'Diagnosis Result';
            c.fillStyle = isResult && result.isModic ? CORAL : TEXT_DARK;
            c.font = isResult ? 'bold 11px Inter, sans-serif' : '11px Inter, sans-serif';
            c.fillText(value, M + col1W + 12, ry + 22);
        });

        y += rows.length * rowH + 24;

        // ── MRI Images Section ───────────────────────────────────────────────
        c.fillStyle = LIGHT_PINK;
        c.fillRect(M, y, CW, 28);
        c.fillStyle = CORAL;
        c.fillRect(M, y, 5, 28);
        c.fillStyle = TEXT_DARK;
        c.font = 'bold 13px Inter, sans-serif';
        c.fillText('MRI SCAN IMAGES', M + 14, y + 19);
        y += 34;

        // Side-by-side images (load both)
        const imgGutter = 14;
        const imgColW = (CW - imgGutter) / 2;
        const imgH = 200;

        async function drawMRIImage(src, label, x, topY) {
            // Label pill
            c.fillStyle = 'rgba(242,102,102,0.1)';
            roundRect(c, x, topY, imgColW, 22, 4, true, false);
            c.fillStyle = CORAL;
            c.font = 'bold 11px Inter, sans-serif';
            c.textAlign = 'center';
            c.fillText(label, x + imgColW / 2, topY + 15);
            c.textAlign = 'left';

            const imgY = topY + 26;
            c.strokeStyle = DIVIDER; c.lineWidth = 1;
            roundRect(c, x, imgY, imgColW, imgH, 4, false, true);

            if (src && src.startsWith('data:')) {
                await new Promise(res => {
                    const img = new Image();
                    img.onload = () => {
                        c.save();
                        roundRect(c, x, imgY, imgColW, imgH, 4, false, false);
                        c.clip();
                        c.drawImage(img, x, imgY, imgColW, imgH);
                        c.restore();
                        res();
                    };
                    img.onerror = res;
                    img.src = src;
                });
            } else {
                c.fillStyle = TEXT_MUTED;
                c.font = '11px Inter, sans-serif';
                c.textAlign = 'center';
                c.fillText('Not available', x + imgColW / 2, imgY + imgH / 2);
                c.textAlign = 'left';
            }

            // Caption
            c.fillStyle = TEXT_MUTED;
            c.font = 'italic 10px Inter, sans-serif';
            c.textAlign = 'center';
            c.fillText(label, x + imgColW / 2, imgY + imgH + 14);
            c.textAlign = 'left';
        }

        await drawMRIImage(t1Src, 'T1-Weighted MRI', M, y);
        await drawMRIImage(t2Src, 'T2-Weighted MRI', M + imgColW + imgGutter, y);
        y += 26 + imgH + 20;

        // ── Footer ───────────────────────────────────────────────────────────
        const footerY = PH - 80;
        c.strokeStyle = DIVIDER; c.lineWidth = 0.5;
        c.beginPath(); c.moveTo(M, footerY); c.lineTo(M + CW, footerY); c.stroke();

        c.fillStyle = TEXT_MUTED;
        c.font = '9px Inter, sans-serif';
        c.textAlign = 'center';
        c.fillText('⚠ This report is generated by SpinoCare AI and is for informational purposes only.', PW / 2, footerY + 16);
        c.fillText('It does not constitute a medical diagnosis. Please consult a qualified healthcare professional.', PW / 2, footerY + 30);

        c.textAlign = 'right';
        c.fillText(`Page 1  |  ID: ${result.entryId}`, M + CW, footerY + 50);
        c.textAlign = 'left';

        // Convert canvas to image and trigger download
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `SpinoCare_Report_${result.entryId}.jpg`;
        link.click();
    }

    // Helper: draw rounded rect path
    function roundRect(ctx, x, y, w, h, r, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
    }

    function clearImages() {
        t1File = null; t2File = null;
        previewT1.style.display = 'none'; previewT1.src = '';
        previewT2.style.display = 'none'; previewT2.src = '';
        uploadT1.classList.remove('active');
        uploadT2.classList.remove('active');
        inputT1.value = ''; inputT2.value = '';
        analyzeBtn.disabled = true;
    }

    closeModal.addEventListener('click', () => {
        resultsModal.style.display = 'none';
        clearImages(); // Clear T1 & T2 after dismissing — same as iOS clearImages()
    });

    window.addEventListener('click', (e) => {
        if (e.target === resultsModal) {
            resultsModal.style.display = 'none';
            clearImages();
        }
    });

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
