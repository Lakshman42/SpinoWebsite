/**
 * SpinoCare Web Image Editor
 * Ported from iOS ImageEditorView.swift
 * Features: 1:1 Crop, Pan, Scale, Rotate, Rule-of-Thirds Grid, Ruler Sliders
 */

class ImageEditor {
    constructor() {
        this.modal = null;
        this.canvas = null;
        this.ctx = null;
        this.img = null;
        this.onComplete = null;

        // Transform state (mirrors iOS @State vars)
        this.scale = 1.0;
        this.rotation = 0; // degrees
        this.offsetX = 0;
        this.offsetY = 0;
        this.selectedTool = 'Scale'; // 'Scale' or 'Rotate'

        // Drag state
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Ruler drag state
        this.isRulerDragging = false;
        this.rulerLastX = 0;

        this._injectStyles();
        this._buildModal();
    }

    open(imageFile, onComplete) {
        this.onComplete = onComplete;
        this.scale = 1.0;
        this.rotation = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.selectedTool = 'Scale';

        const reader = new FileReader();
        reader.onload = (e) => {
            this.img = new Image();
            this.img.onload = () => {
                this.modal.style.display = 'flex';
                requestAnimationFrame(() => this._draw());
                this._updateSliderUI();
            };
            this.img.src = e.target.result;
        };
        reader.readAsDataURL(imageFile);
    }

    _buildModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'img-editor-modal';
        this.modal.innerHTML = `
            <div id="img-editor-container">
                <!-- Header -->
                <div id="img-editor-header">
                    <button id="img-editor-cancel"><i class="fa-solid fa-xmark"></i></button>
                    <span id="img-editor-title">Crop Image (1:1)</span>
                    <button id="img-editor-done"><i class="fa-solid fa-check"></i></button>
                </div>

                <!-- Canvas Area -->
                <div id="img-editor-canvas-wrap">
                    <canvas id="img-editor-canvas"></canvas>
                </div>

                <!-- Bottom Controls -->
                <div id="img-editor-bottom">
                    <!-- Ruler -->
                    <div id="img-editor-ruler-wrap">
                        <div id="img-editor-ruler-label">100%</div>
                        <div id="img-editor-ruler">
                            <canvas id="img-editor-ruler-canvas"></canvas>
                            <div id="img-editor-ruler-center-line"></div>
                        </div>
                    </div>

                    <!-- Tool Buttons -->
                    <div id="img-editor-toolbar">
                        <button class="editor-tool-btn active" id="tool-scale">
                            <i class="fa-solid fa-expand"></i>
                            <span>Scale</span>
                        </button>
                        <button class="editor-tool-btn" id="tool-rotate">
                            <i class="fa-solid fa-rotate"></i>
                            <span>Rotate</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);

        this.canvas = document.getElementById('img-editor-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Bind events
        document.getElementById('img-editor-cancel').addEventListener('click', () => this._close());
        document.getElementById('img-editor-done').addEventListener('click', () => this._done());
        document.getElementById('tool-scale').addEventListener('click', () => this._selectTool('Scale'));
        document.getElementById('tool-rotate').addEventListener('click', () => this._selectTool('Rotate'));

        // Canvas drag (pan)
        const canvasEl = document.getElementById('img-editor-canvas');
        canvasEl.addEventListener('mousedown', (e) => { this.isDragging = true; this.lastMouseX = e.clientX; this.lastMouseY = e.clientY; });
        canvasEl.addEventListener('touchstart', (e) => { this.isDragging = true; this.lastMouseX = e.touches[0].clientX; this.lastMouseY = e.touches[0].clientY; }, { passive: true });
        window.addEventListener('mousemove', (e) => this._onCanvasDrag(e.clientX, e.clientY));
        window.addEventListener('touchmove', (e) => { if (this.isDragging) this._onCanvasDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
        window.addEventListener('mouseup', () => { this.isDragging = false; });
        window.addEventListener('touchend', () => { this.isDragging = false; this.isRulerDragging = false; });

        // Ruler drag
        const ruler = document.getElementById('img-editor-ruler');
        ruler.addEventListener('mousedown', (e) => { this.isRulerDragging = true; this.rulerLastX = e.clientX; e.preventDefault(); });
        ruler.addEventListener('touchstart', (e) => { this.isRulerDragging = true; this.rulerLastX = e.touches[0].clientX; }, { passive: true });
        window.addEventListener('mousemove', (e) => this._onRulerDrag(e.clientX));
        window.addEventListener('touchmove', (e) => { if (this.isRulerDragging) this._onRulerDrag(e.touches[0].clientX); }, { passive: true });
        window.addEventListener('mouseup', () => { this.isRulerDragging = false; });

        // Pinch to zoom
        canvasEl.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.scale = Math.max(0.5, Math.min(4.0, this.scale - e.deltaY * 0.001));
            this._updateSliderUI();
            this._draw();
        }, { passive: false });
    }

    _selectTool(tool) {
        this.selectedTool = tool;
        document.getElementById('tool-scale').classList.toggle('active', tool === 'Scale');
        document.getElementById('tool-rotate').classList.toggle('active', tool === 'Rotate');
        this._updateSliderUI();
        this._drawRuler();
    }

    _onCanvasDrag(x, y) {
        if (!this.isDragging) return;
        this.offsetX += x - this.lastMouseX;
        this.offsetY += y - this.lastMouseY;
        this.lastMouseX = x;
        this.lastMouseY = y;
        this._draw();
    }

    _onRulerDrag(x) {
        if (!this.isRulerDragging) return;
        const delta = x - this.rulerLastX;
        this.rulerLastX = x;

        if (this.selectedTool === 'Scale') {
            // sensitivity: 0.005 per px (same as iOS)
            this.scale = Math.max(0.5, Math.min(4.0, this.scale - delta * 0.005));
        } else {
            // sensitivity: 0.5 deg per px (same as iOS)
            this.rotation = Math.max(-180, Math.min(180, this.rotation - delta * 0.5));
        }
        this._updateSliderUI();
        this._draw();
    }

    _updateSliderUI() {
        const label = document.getElementById('img-editor-ruler-label');
        if (this.selectedTool === 'Scale') {
            label.textContent = Math.round(this.scale * 100) + '%';
        } else {
            label.textContent = Math.round(this.rotation) + '°';
        }
        this._drawRuler();
    }

    _drawRuler() {
        const rulerCanvas = document.getElementById('img-editor-ruler-canvas');
        const rc = rulerCanvas.getContext('2d');
        const W = rulerCanvas.offsetWidth;
        const H = rulerCanvas.offsetHeight;
        rulerCanvas.width = W;
        rulerCanvas.height = H;

        rc.clearRect(0, 0, W, H);
        rc.fillStyle = 'white';
        rc.fillRect(0, 0, W, H);

        const spacing = 10; // px per tick
        const value = this.selectedTool === 'Scale' ? this.scale : this.rotation;
        const sensitivity = this.selectedTool === 'Scale' ? 0.005 : 0.5;
        const center = W / 2;

        const valueAsPx = value / sensitivity;
        const offset = valueAsPx % spacing;

        for (let i = -30; i <= 30; i++) {
            const x = center - offset + i * spacing;
            const tickIndex = Math.round((valueAsPx + i * spacing) / spacing);
            const isMajor = tickIndex % 5 === 0;
            const tickH = isMajor ? 22 : 10;

            const dist = Math.abs(x - center);
            const maxDist = center * 0.85;
            const opacity = Math.max(0, 1.0 - dist / maxDist);

            rc.beginPath();
            rc.moveTo(x, H);
            rc.lineTo(x, H - tickH);
            rc.strokeStyle = isMajor
                ? `rgba(0,0,0,${0.5 * opacity})`
                : `rgba(0,0,0,${0.25 * opacity})`;
            rc.lineWidth = isMajor ? 1.5 : 1;
            rc.stroke();
        }
    }

    _draw() {
        const canvasEl = document.getElementById('img-editor-canvas');
        const wrap = document.getElementById('img-editor-canvas-wrap');
        const size = Math.min(wrap.offsetWidth, wrap.offsetHeight) - 20;
        canvasEl.width = size;
        canvasEl.height = size;

        const ctx = canvasEl.getContext('2d');
        ctx.clearRect(0, 0, size, size);

        // Dark background
        ctx.fillStyle = '#111214';
        ctx.fillRect(0, 0, size, size);

        // Draw image with transforms
        ctx.save();
        ctx.translate(size / 2 + this.offsetX, size / 2 + this.offsetY);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.scale(this.scale, this.scale);

        const aspect = this.img.naturalWidth / this.img.naturalHeight;
        let drawW, drawH;
        if (aspect > 1) {
            drawH = size;
            drawW = size * aspect;
        } else {
            drawW = size;
            drawH = size / aspect;
        }
        ctx.drawImage(this.img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        // Dimmer outside the crop square
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        // Top
        ctx.fillRect(0, 0, size, 0);
        // Left
        ctx.fillRect(0, 0, 0, size);

        // 1:1 Crop border
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(0, 0, size, size);

        // Rule of thirds grid
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 2; i++) {
            const pos = (i / 3) * size;
            // Vertical
            ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, size); ctx.stroke();
            // Horizontal
            ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(size, pos); ctx.stroke();
        }

        this._drawRuler();
    }

    _done() {
        // Crop and output 1024x1024 (same as iOS outputSize)
        const outputSize = 1024;
        const offscreen = document.createElement('canvas');
        offscreen.width = outputSize;
        offscreen.height = outputSize;
        const oc = offscreen.getContext('2d');

        oc.fillStyle = '#000';
        oc.fillRect(0, 0, outputSize, outputSize);

        const canvasEl = document.getElementById('img-editor-canvas');
        const displaySize = canvasEl.width;
        const renderScale = outputSize / displaySize;

        oc.save();
        oc.translate(outputSize / 2 + this.offsetX * renderScale, outputSize / 2 + this.offsetY * renderScale);
        oc.rotate(this.rotation * Math.PI / 180);
        oc.scale(this.scale, this.scale);

        const aspect = this.img.naturalWidth / this.img.naturalHeight;
        let drawW, drawH;
        if (aspect > 1) {
            drawH = outputSize;
            drawW = outputSize * aspect;
        } else {
            drawW = outputSize;
            drawH = outputSize / aspect;
        }
        oc.drawImage(this.img, -drawW / 2, -drawH / 2, drawW, drawH);
        oc.restore();

        // Convert to blob and pass to callback
        offscreen.toBlob((blob) => {
            const file = new File([blob], 'cropped_mri.jpg', { type: 'image/jpeg' });
            const url = URL.createObjectURL(blob);
            this._close();
            if (this.onComplete) this.onComplete(file, url);
        }, 'image/jpeg', 0.95);
    }

    _close() {
        this.modal.style.display = 'none';
    }

    _injectStyles() {
        if (document.getElementById('img-editor-styles')) return;
        const style = document.createElement('style');
        style.id = 'img-editor-styles';
        style.textContent = `
            #img-editor-modal {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.85);
                z-index: 10000;
                align-items: center;
                justify-content: center;
            }
            #img-editor-container {
                width: min(520px, 96vw);
                max-height: 92vh;
                background: #14161A;
                border-radius: 20px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(0,0,0,0.6);
            }
            #img-editor-header {
                background: #F26666;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 14px 18px;
                flex-shrink: 0;
            }
            #img-editor-title {
                color: white;
                font-family: 'Inter', sans-serif;
                font-size: 1rem;
                font-weight: 700;
            }
            #img-editor-header button {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 6px;
                transition: background 0.2s;
            }
            #img-editor-header button:hover {
                background: rgba(255,255,255,0.2);
            }
            #img-editor-canvas-wrap {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #111214;
                min-height: 280px;
                padding: 10px;
                cursor: grab;
            }
            #img-editor-canvas-wrap:active {
                cursor: grabbing;
            }
            #img-editor-canvas {
                display: block;
                touch-action: none;
            }
            #img-editor-bottom {
                background: #14161A;
                flex-shrink: 0;
            }
            #img-editor-ruler-wrap {
                background: white;
                border-radius: 12px 12px 0 0;
                padding: 4px 0 0 0;
            }
            #img-editor-ruler-label {
                text-align: center;
                color: #F26666;
                font-family: 'Inter', sans-serif;
                font-size: 0.8rem;
                font-weight: 700;
                padding-top: 4px;
            }
            #img-editor-ruler {
                position: relative;
                height: 38px;
                cursor: ew-resize;
                user-select: none;
                touch-action: none;
            }
            #img-editor-ruler-canvas {
                width: 100%;
                height: 38px;
                display: block;
            }
            #img-editor-ruler-center-line {
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 3px;
                height: 42px;
                background: #F26666;
                border-radius: 2px;
                pointer-events: none;
            }
            #img-editor-toolbar {
                display: flex;
                padding: 14px 0 16px;
                background: #14161A;
            }
            .editor-tool-btn {
                flex: 1;
                background: none;
                border: none;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
                color: rgba(255,255,255,0.35);
                font-family: 'Inter', sans-serif;
                font-size: 0.7rem;
                font-weight: 700;
                transition: color 0.2s;
            }
            .editor-tool-btn i {
                font-size: 1.3rem;
            }
            .editor-tool-btn.active {
                color: #F26666;
            }
        `;
        document.head.appendChild(style);
    }
}

// Export singleton
window.SpinoCareImageEditor = new ImageEditor();
