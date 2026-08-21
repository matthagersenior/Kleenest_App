import { useEffect, useRef, useState } from 'react';
import { Camera, Check, X } from 'lucide-react';

export default function CameraQrScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(null);
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(true);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    let active = true;
    async function start() {
      if (!('BarcodeDetector' in window) || !navigator.mediaDevices?.getUserMedia) {
        setSupported(false);
        return;
      }
      try {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        if (!active) { stream.getTracks().forEach(track => track.stop()); return; }
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const scan = async () => {
          if (!active || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            const value = codes?.find(code => code.rawValue)?.rawValue;
            if (value) { onDetected(value); return; }
          } catch { /* Ignore transient camera-frame errors. */ }
          frameRef.current = requestAnimationFrame(scan);
        };
        frameRef.current = requestAnimationFrame(scan);
      } catch (e) {
        setError(e.name === 'NotAllowedError' ? 'Camera permission was denied.' : e.message || 'Unable to access the camera.');
      }
    }
    start();
    return () => {
      active = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    };
  }, [onDetected]);

  function submitManual(e) {
    e.preventDefault();
    const value = manualCode.trim();
    if (!value) return;
    onDetected(value);
  }

  const manualFallback = <form className="qr-manual-fallback" onSubmit={submitManual}>
    <label htmlFor="kleenest-qr-code">Enter QR code</label>
    <div className="hero-actions">
      <input id="kleenest-qr-code" value={manualCode} onChange={e => setManualCode(e.target.value)} placeholder="Paste or type the code" autoComplete="off" />
      <button className="primary" type="submit" disabled={!manualCode.trim()}><Check size={16}/>Continue</button>
    </div>
  </form>;

  return <div className="qr-scanner" role="dialog" aria-label="Scan Kleenest QR code">
    <div className="qr-scanner-header"><div><span className="eyebrow">CAMERA CHECK-IN</span><h3><Camera size={18}/> Scan QR code</h3></div><button className="icon-button" onClick={onClose} aria-label="Close scanner"><X/></button></div>
    {!supported ? <div className="empty-state"><p>Your browser does not support native QR scanning.</p>{manualFallback}</div> : error ? <><div className="form-error" role="alert">{error}</div>{manualFallback}</> : <><div className="qr-camera-frame"><video ref={videoRef} playsInline muted aria-label="QR camera preview"/><div className="qr-target"/></div>{manualFallback}</>}
  </div>;
}
