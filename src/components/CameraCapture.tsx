import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from './Common';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
  facingMode?: 'user' | 'environment';
  aspectRatio?: 'video' | 'square';
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onCancel,
  facingMode = 'environment',
  aspectRatio = 'video'
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera
  const startCamera = async () => {
    setIsInitializing(true);
    setPermissionError(null);
    try {
      // If there is an existing stream, stop it first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      let errorMsg = 'Could not access the camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera access denied. Please grant camera permission in your browser address bar or use the file upload fallback tab.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera found on this device. Please use the file upload fallback tab.';
      } else {
        errorMsg = `Camera error: ${err.message || err.name || 'Unknown source'}. Please try the upload fallback.`;
      }
      setPermissionError(errorMsg);
      setActiveTab('upload');
    } finally {
      setIsInitializing(false);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  // Start camera on tab change or mount
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab]);

  // Handle capture shutter
  const handleShutter = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    
    // Set canvas dimensions to match video stream
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Flip context if user-facing for mirror effect
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // If square aspect ratio, crop to center square
      if (aspectRatio === 'square') {
        const size = Math.min(canvas.width, canvas.height);
        const xOffset = (canvas.width - size) / 2;
        const yOffset = (canvas.height - size) / 2;
        
        const squareCanvas = document.createElement('canvas');
        squareCanvas.width = size;
        squareCanvas.height = size;
        const squareCtx = squareCanvas.getContext('2d');
        if (squareCtx) {
          squareCtx.drawImage(canvas, xOffset, yOffset, size, size, 0, 0, size, size);
          const dataUrl = squareCanvas.toDataURL('image/jpeg', 0.85);
          stopCamera();
          onCapture(dataUrl);
          return;
        }
      }
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      stopCamera();
      onCapture(dataUrl);
    }
  };

  // File Upload fallback change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onCapture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onCapture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-charcoal rounded-2xl p-5 text-white space-y-4 border border-[rgba(184,135,61,0.25)] relative overflow-hidden text-left" id="camera-capture-container">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeTab === 'camera' && cameraActive ? 'bg-success' : 'bg-warning'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${activeTab === 'camera' && cameraActive ? 'bg-success' : 'bg-warning'}`}></span>
          </span>
          <span className="text-xs font-mono font-bold uppercase text-antiquegold tracking-wider">
            {activeTab === 'camera' ? 'LIVE DEVICE CAMERA CAPTURE' : 'SECURE FILE SELECTION'}
          </span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-black/35 rounded-xl p-1 gap-1 border border-white/5">
        <button
          type="button"
          onClick={() => setActiveTab('camera')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'camera' 
              ? 'bg-antiquegold text-white shadow-xs' 
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Live Video Stream</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'upload' 
              ? 'bg-antiquegold text-white shadow-xs' 
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Image / File</span>
        </button>
      </div>

      {/* Main Area */}
      {activeTab === 'camera' ? (
        <div className="space-y-4">
          <div className={`relative bg-black rounded-xl border border-white/10 overflow-hidden flex items-center justify-center ${
            aspectRatio === 'square' ? 'aspect-square max-h-[320px] w-full' : 'aspect-video'
          }`}>
            {isInitializing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 z-10 text-white/75">
                <RefreshCw className="w-6 h-6 animate-spin text-antiquegold" />
                <span className="text-xs font-mono">Initializing camera stream...</span>
              </div>
            )}
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Target alignment frame guides */}
            <div className="absolute inset-6 border-2 border-dashed border-antiquegold/40 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-[9px] font-mono font-bold tracking-widest text-antiquegold/55 uppercase bg-black/60 px-2 py-1 rounded">
                ALIGN SUBJECT HERE
              </span>
            </div>
          </div>

          {permissionError && (
            <div className="p-3 bg-error/15 border border-error/25 rounded-xl flex items-start gap-2.5 text-xs text-error/95 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-error" />
              <span>{permissionError}</span>
            </div>
          )}

          <div className="flex justify-between items-center gap-3">
            <span className="text-[10px] text-white/50 font-mono hidden sm:inline">
              Framer: WebRTC video stream
            </span>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="secondary"
                onClick={onCancel}
                className="flex-1 sm:flex-none text-xs text-white bg-white/10 hover:bg-white/20 border-none"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleShutter}
                disabled={!cameraActive || isInitializing}
                className="flex-1 sm:flex-none text-xs py-2 px-5 bg-antiquegold hover:bg-[#a37532] text-white font-extrabold flex items-center justify-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Photo</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* File Upload Tab */
        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 hover:border-antiquegold rounded-xl p-8 text-center cursor-pointer hover:bg-white/5 transition-all space-y-3 flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-antiquegold text-xl">
              <Upload className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">Drag and drop your image here, or browse</p>
              <p className="text-[10px] text-white/50">Supports JPEG, PNG up to 10MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {permissionError && (
            <div className="p-3 bg-[#E08D1F]/15 border border-[#E08D1F]/25 rounded-xl flex items-start gap-2 text-xs text-[#E08D1F] leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Note: Geolocation frames and device cameras may require HTTPS or direct non-iframe execution in preview tab.</span>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={onCancel}
              className="text-xs text-white bg-white/10 hover:bg-white/20 border-none"
            >
              Close Panel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
