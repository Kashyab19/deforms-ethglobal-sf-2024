import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import CryptoJS from 'crypto-js';

const BiometricVerification = ({ onVerificationComplete }) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    };
    loadModels();
  }, []);

  const startVerification = async () => {
    setIsVerifying(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    videoRef.current.srcObject = stream;
  };

  const handleVideoPlay = async () => {
    const canvas = faceapi.createCanvasFromMedia(videoRef.current);
    canvasRef.current.appendChild(canvas);

    const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
    faceapi.matchDimensions(canvas, displaySize);

    const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (detection) {
      const resizedDetection = faceapi.resizeResults(detection, displaySize);
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetection);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);

      const landmarks = detection.landmarks.positions;
      const landmarkString = landmarks.map(l => `${l.x},${l.y}`).join('|');
      const hash = CryptoJS.SHA256(landmarkString).toString();

      onVerificationComplete(hash);
      setIsVerifying(false);
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div>
      <button onClick={startVerification} disabled={isVerifying}>
        {isVerifying ? 'Verifying...' : 'Start Biometric Verification'}
      </button>
      <div>
        <video
          ref={videoRef}
          width="720"
          height="560"
          onPlay={handleVideoPlay}
          style={{ display: isVerifying ? 'block' : 'none' }}
          autoPlay
          muted
        />
        <div ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      </div>
    </div>
  );
};

export default BiometricVerification;
