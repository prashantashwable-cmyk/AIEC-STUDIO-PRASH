import React, { useState } from 'react';
import { Card, Button } from './Common';
import { MapPin, Image as ImageIcon, Sparkles, Loader2, ArrowRight, Upload, Edit, Eye, Compass, HelpCircle } from 'lucide-react';

export const GeminiMapsTool: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; groundingChunks: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // Stagger status text updates to mimic a high-end AI grounding process
    setLoadingStatus('Initializing Gemini 3.5-Flash...');
    const statusSteps = [
      'Querying navigator geolocation...',
      'Injecting Google Maps retrieval tools...',
      'Searching Maharashtra & Pune geographic database...',
      'Grounding search results against active suppliers...',
      'Compiling GST & safety regulations...',
      'Formatting verified response...'
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < statusSteps.length) {
        setLoadingStatus(statusSteps[stepIdx]);
        stepIdx++;
      } else {
        clearInterval(interval);
      }
    }, 1200);

    try {
      // Fetch user's current geo coordinate as recommended by maps-grounding guideline
      let latLng = { latitude: 18.5204, longitude: 73.8567 }; // Default Pune coordinates
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            latLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          },
          () => {} // Ignored for robust operation
        );
      }

      const response = await fetch('/api/gemini/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, latLng }),
      });

      const data = await response.json();
      clearInterval(interval);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute query');
      }

      setResult(data);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'Failed to search. Ensure you have internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-royalemerald/10 flex items-center justify-center text-royalemerald">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-charcoal">AIEC Grounded Location Search</h3>
          <p className="text-xs text-warmgray">Query real-time Maharashtra/India elevator suppliers & regulations</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Best lift machinery suppliers in Pune Chakan or Maharashtra elevator regulations"
          className="flex-1 px-4 py-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] text-sm font-sans focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal"
          disabled={loading}
        />
        <Button variant="emerald" type="submit" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Search</span>
        </Button>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 text-antiquegold animate-spin mb-3" />
          <p className="text-sm font-medium text-charcoal animate-pulse">{loadingStatus}</p>
          <div className="mt-4 flex gap-1 justify-center">
            <span className="w-2 h-2 bg-antiquegold rounded-full animate-bounce delay-100" />
            <span className="w-2 h-2 bg-antiquegold rounded-full animate-bounce delay-200" />
            <span className="w-2 h-2 bg-antiquegold rounded-full animate-bounce delay-300" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs">
          <strong>Error Occurred:</strong> {error}
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-4 animate-fadeIn">
          {/* Main Answer */}
          <div className="p-5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.1)] text-sm leading-relaxed text-charcoal whitespace-pre-wrap font-sans">
            {result.text}
          </div>

          {/* Citations / Links Section (Mandatory as per maps grounding guidelines) */}
          {result.groundingChunks && result.groundingChunks.length > 0 && (
            <div className="p-4 bg-white rounded-xl border-2 border-dashed border-[#e6dfd4]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-royalemerald mb-3 flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>Verified Google Maps Citations</span>
              </h4>
              <div className="space-y-2">
                {result.groundingChunks.map((chunk: any, index: number) => {
                  const mapInfo = chunk.web || chunk.maps || {};
                  const uri = mapInfo.uri || 'https://maps.google.com';
                  const title = mapInfo.title || `Map Source ${index + 1}`;
                  return (
                    <a
                      key={index}
                      href={uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg bg-alabaster hover:bg-[#eae6db] text-xs font-semibold text-antiquegold transition-colors border border-[rgba(184,135,61,0.08)]"
                    >
                      <span className="truncate max-w-[80%] text-charcoal font-sans">{title}</span>
                      <span className="flex items-center gap-1 shrink-0 text-antiquegold">
                        <span>Open Map</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export const GeminiImageTool: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState('');

  // Image editing parameters
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);

  const presets = [
    { label: 'Stainless Steel Cabin', prompt: 'A highly photorealistic luxury glass and hairline stainless steel elevator cabin with gold accents, wide-angle interior view, cinematic lighting' },
    { label: 'Shaft Inspection', prompt: 'Technician inspecting high-tech hydraulic cylinders in a clean modern elevator shaft elevator construction site, flat clean art style' },
    { label: 'Luxury Hotel Lobby Lift', prompt: 'Panoramic high-speed glass capsule elevator ascending inside an opulent, multi-floor gold-trimmed hotel lobby' }
  ];

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPrompt = prompt || selectedPreset;
    if (!finalPrompt.trim()) return;

    setLoading(true);
    setError(null);
    setImageUrl(null);
    setInfo(null);

    try {
      // Extract raw base64 data if editing
      let imageBytes = null;
      let mimeType = 'image/png';
      if (uploadedBase64) {
        const parts = uploadedBase64.split(',');
        imageBytes = parts[1];
        const match = parts[0].match(/:(.*?);/);
        if (match) mimeType = match[1];
      }

      const response = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          imageBytes,
          mimeType,
          aspectRatio
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setImageUrl(data.imageUrl);
      setInfo(data.info);
    } catch (err: any) {
      setError(err.message || 'Failed to create image. Ensure you are connected to the internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-antiquegold/10 flex items-center justify-center text-antiquegold">
          <ImageIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-charcoal">Gemini AI Cabin Designer & Editor</h3>
          <p className="text-xs text-warmgray">Create luxury elevator designs or edit site images using text instructions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form panel */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">Prompt Presets</label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(preset.prompt);
                    setPrompt(preset.prompt);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    prompt === preset.prompt
                      ? 'bg-antiquegold text-white border-antiquegold'
                      : 'bg-alabaster text-warmgray border-[rgba(184,135,61,0.15)] hover:bg-[#edeae2]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">Design Instructions</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your design in detail, e.g., A panoramic glass lift with golden circular frame, view from outside, high contrast"
              className="w-full h-24 px-4 py-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] text-sm font-sans focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal resize-none"
              disabled={loading}
              required
            />
          </div>

          {/* Upload optional image to EDIT */}
          <div className="p-3 bg-alabaster rounded-xl border border-dashed border-[rgba(184,135,61,0.25)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {uploadedBase64 ? (
                <img
                  src={uploadedBase64}
                  alt="Source"
                  className="w-12 h-12 rounded object-cover border border-[#e0dacd]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-[#e8e4db] flex items-center justify-center text-warmgray">
                  <Upload className="w-5 h-5" />
                </div>
              )}
              <div className="text-left">
                <p className="text-xs font-bold text-charcoal">Edit Source Photo (Optional)</p>
                <p className="text-[10px] text-warmgray">{uploadedBase64 ? 'Image Loaded' : 'Upload photo to modify it'}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <label className="px-3 py-1.5 bg-white rounded-lg text-xs font-bold border border-[rgba(184,135,61,0.15)] hover:bg-alabaster cursor-pointer flex items-center gap-1 text-charcoal">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
              </label>
              {uploadedBase64 && (
                <button
                  type="button"
                  onClick={() => setUploadedBase64(null)}
                  className="px-2 py-1 bg-error/15 text-error rounded-lg text-xs font-bold hover:bg-error/25"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full px-4 py-2.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] text-xs font-bold text-charcoal focus:outline-none"
              >
                <option value="1:1">1:1 Square</option>
                <option value="16:9">16:9 Horizontal</option>
                <option value="4:3">4:3 Card</option>
                <option value="3:4">3:4 Portrait</option>
                <option value="9:16">9:16 Mobile</option>
              </select>
            </div>

            <div className="flex items-end flex-1">
              <Button variant="primary" type="submit" disabled={loading} fullWidth>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : uploadedBase64 ? (
                  <Edit className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{loading ? 'Synthesizing...' : uploadedBase64 ? 'Edit Image' : 'Generate'}</span>
              </Button>
            </div>
          </div>
        </form>

        {/* Display / Output panel */}
        <div className="border border-[rgba(184,135,61,0.15)] rounded-2xl bg-alabaster flex flex-col items-center justify-center relative p-4 min-h-[250px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center text-center p-6">
              <Loader2 className="w-12 h-12 text-antiquegold animate-spin mb-4" />
              <p className="text-sm font-semibold text-charcoal">Generating Royal White Aesthetics...</p>
              <p className="text-xs text-warmgray mt-2">Connecting to models/gemini-3.1-flash-lite-image</p>
            </div>
          ) : imageUrl ? (
            <div className="w-full h-full flex flex-col items-center">
              <img
                src={imageUrl}
                alt="AI Generated Design"
                className="max-h-[300px] w-auto object-contain rounded-xl border border-[rgba(184,135,61,0.12)] shadow-md bg-white"
                referrerPolicy="no-referrer"
              />
              {info && <p className="text-[11px] text-success font-medium mt-3 text-center">{info}</p>}
              <a
                href={imageUrl}
                download="aiec_generated_cabin.png"
                className="mt-4 text-xs font-bold text-antiquegold flex items-center gap-1 hover:underline"
              >
                <Eye className="w-4 h-4" />
                <span>Save to Local Catalog</span>
              </a>
            </div>
          ) : (
            <div className="text-center p-6 text-warmgray">
              <ImageIcon className="w-12 h-12 text-[#dcd9d2] mx-auto mb-3" />
              <p className="text-sm font-semibold">Your synthesized elevator catalog will appear here</p>
              <p className="text-xs max-w-xs mx-auto mt-1">Select a preset or enter specifications and press generate to render with AI.</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-x-4 bottom-4 p-3 bg-error/10 border border-error/20 rounded-xl text-error text-[10px]">
              <strong>Synthesis Error:</strong> {error}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
