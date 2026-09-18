import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { barcodeAPI } from '../services/api';

function BarcodeScanner({ onScan, onClose }) {
  const [error, setError] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [productInfo, setProductInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      setError('');
      setIsScanning(true);
      setCameraReady(false);

      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported in this browser');
        setIsScanning(false);
        return;
      }

      // Create scanner instance
      const html5QrCode = new Html5Qrcode("scanner-container");
      scannerRef.current = html5QrCode;

      const config = {
        fps: 30,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0,
      };

      // Start scanning
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanError
      );

      setCameraReady(true);
      setIsScanning(true);

    } catch (err) {
      console.error('Scanner error:', err);
      let errorMsg = 'Failed to access camera: ';
      
      if (err.message && err.message.includes('Permission')) {
        errorMsg += 'Please allow camera access and try again.';
      } else if (err.message && err.message.includes('NotFound')) {
        errorMsg += 'No camera found on this device.';
      } else if (err.message && err.message.includes('NotReadable')) {
        errorMsg += 'Camera is in use by another application.';
      } else {
        errorMsg += err.message || 'Unknown error';
      }
      
      setError(errorMsg);
      setIsScanning(false);
      setCameraReady(false);
    }
  };

  const onScanSuccess = async (decodedText, decodedResult) => {
    // Prevent multiple scans
    if (isLoading) return;
    
    setScannedCode(decodedText);
    setIsLoading(true);
    
    try {
      // Look up the barcode in your database
      const response = await barcodeAPI.lookup(decodedText);
      setProductInfo(response.data.product);
      
      // Wait a moment to show the result, then close
      timeoutRef.current = setTimeout(() => {
        onScan(decodedText, response.data.product);
        stopScanner();
      }, 1000);
      
    } catch (error) {
      // If lookup fails, still pass the scanned code
      timeoutRef.current = setTimeout(() => {
        onScan(decodedText);
        stopScanner();
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const onScanError = (err) => {
    // Ignore errors - they're usually just "no barcode found"
    // Only log if it's a real error
    if (err && err.message && !err.message.includes('No MultiFormat')) {
      console.warn('Scan error:', err);
    }
  };

  const stopScanner = async () => {
    setIsScanning(false);
    setCameraReady(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
    }
  };

  const handleClose = () => {
    stopScanner();
    if (onClose) onClose();
  };

  const handleManualSubmit = async () => {
    if (scannedCode && scannedCode.length >= 8) {
      setIsLoading(true);
      try {
        const response = await barcodeAPI.lookup(scannedCode);
        onScan(scannedCode, response.data.product);
        handleClose();
      } catch (error) {
        onScan(scannedCode);
        handleClose();
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Please enter a valid barcode (minimum 8 digits)');
    }
  };

  const handleRetry = () => {
    setError('');
    setScannedCode('');
    setProductInfo(null);
    stopScanner();
    setTimeout(() => {
      startScanner();
    }, 500);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>📷 Scan Barcode</h2>
          <button onClick={handleClose} style={styles.closeButton}>✕</button>
        </div>
        
        <p style={styles.subtitle}>Position the barcode in the center of the frame</p>

        <div style={styles.videoContainer}>
          {/* Scanner container */}
          <div 
            id="scanner-container" 
            ref={containerRef}
            style={styles.scannerContainer}
          />
          
          {!cameraReady && !error && (
            <div style={styles.startingStatus}>
              <div style={{ fontSize: '24px' }}>⏳</div>
              <div style={{ marginTop: '10px' }}>Starting camera...</div>
            </div>
          )}

          {cameraReady && !error && (
            <div style={styles.overlayFrame}>
              <div style={styles.cornerTL} />
              <div style={styles.cornerTR} />
              <div style={styles.cornerBL} />
              <div style={styles.cornerBR} />
              <div style={styles.scanLine} />
            </div>
          )}

          {error && (
            <div style={styles.errorBox}>
              <span style={{ flex: 1 }}>⚠️ {error}</span>
              <button onClick={handleRetry} style={styles.retryButton}>
                Retry
              </button>
            </div>
          )}

          {isScanning && !error && !scannedCode && cameraReady && (
            <div style={styles.scanningStatus}>🔍 Scanning...</div>
          )}

          {isLoading && (
            <div style={styles.loadingStatus}>⏳ Looking up product...</div>
          )}

          {scannedCode && !isLoading && (
            <div style={styles.scannedStatus}>
              ✅ Scanned: {scannedCode}
              {productInfo && (
                <div style={styles.productInfo}>
                  📦 {productInfo.product_name}
                  {productInfo.category && ` (${productInfo.category})`}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={styles.manualContainer}>
          <input
            type="text"
            placeholder="Or enter barcode manually..."
            value={scannedCode}
            onChange={(e) => setScannedCode(e.target.value.replace(/[^0-9]/g, ''))}
            onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
            style={styles.manualInput}
          />
          <button
            onClick={handleManualSubmit}
            disabled={isLoading}
            style={{
              ...styles.manualButton,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '⏳' : 'Enter'}
          </button>
        </div>

        <div style={styles.instructions}>
          <span>📱 Supports: EAN-13, UPC, QR Code, Code 128, and more</span>
        </div>
      </div>

      <style>
        {`
          @keyframes scanLine {
            0%, 100% { top: 20%; }
            50% { top: 75%; }
          }
          
          #scanner-container video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          }
          
          #scanner-container {
            width: 100% !important;
            height: 100% !important;
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.92)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  container: {
    width: '100%',
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  title: {
    color: 'white',
    fontSize: '22px',
    margin: 0,
  },
  closeButton: {
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: '8px',
  },
  subtitle: {
    color: '#aaa',
    fontSize: '14px',
    marginBottom: '15px',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4/3',
    backgroundColor: '#000',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '2px solid #007bff',
  },
  scannerContainer: {
    width: '100%',
    height: '100%',
  },
  overlayFrame: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  cornerTL: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    width: '30px',
    height: '30px',
    borderTop: '3px solid #00ff88',
    borderLeft: '3px solid #00ff88',
    borderRadius: '4px 0 0 0',
  },
  cornerTR: {
    position: 'absolute',
    top: '20%',
    right: '20%',
    width: '30px',
    height: '30px',
    borderTop: '3px solid #00ff88',
    borderRight: '3px solid #00ff88',
    borderRadius: '0 4px 0 0',
  },
  cornerBL: {
    position: 'absolute',
    bottom: '20%',
    left: '20%',
    width: '30px',
    height: '30px',
    borderBottom: '3px solid #00ff88',
    borderLeft: '3px solid #00ff88',
    borderRadius: '0 0 0 4px',
  },
  cornerBR: {
    position: 'absolute',
    bottom: '20%',
    right: '20%',
    width: '30px',
    height: '30px',
    borderBottom: '3px solid #00ff88',
    borderRight: '3px solid #00ff88',
    borderRadius: '0 0 4px 0',
  },
  scanLine: {
    position: 'absolute',
    left: '22%',
    width: '56%',
    height: '2px',
    backgroundColor: '#00ff88',
    boxShadow: '0 0 20px #00ff88',
    animation: 'scanLine 2s ease-in-out infinite',
  },
  errorBox: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    right: '20px',
    backgroundColor: 'rgba(220, 53, 69, 0.95)',
    padding: '12px 16px',
    borderRadius: '8px',
    color: 'white',
    textAlign: 'center',
    fontSize: '13px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  retryButton: {
    padding: '6px 20px',
    backgroundColor: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#333',
    fontWeight: '600',
    fontSize: '13px',
  },
  startingStatus: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'white',
    fontSize: '18px',
    fontWeight: '500',
    textAlign: 'center',
  },
  scanningStatus: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    right: '20px',
    backgroundColor: 'rgba(0, 123, 255, 0.85)',
    padding: '10px',
    borderRadius: '8px',
    color: 'white',
    textAlign: 'center',
    fontSize: '13px',
  },
  loadingStatus: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    right: '20px',
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    padding: '10px',
    borderRadius: '8px',
    color: '#333',
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: '600',
  },
  scannedStatus: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    right: '20px',
    backgroundColor: 'rgba(40, 167, 69, 0.9)',
    padding: '10px 16px',
    borderRadius: '8px',
    color: 'white',
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: '600',
  },
  productInfo: {
    fontSize: '12px',
    fontWeight: '400',
    marginTop: '4px',
    opacity: 0.9,
  },
  manualContainer: {
    width: '100%',
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  manualInput: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #444',
    fontSize: '16px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    outline: 'none',
  },
  manualButton: {
    padding: '12px 24px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  instructions: {
    marginTop: '15px',
    color: '#888',
    fontSize: '12px',
  },
};

export default BarcodeScanner;