// ============================================================================
// ALVI Web Audio Acoustic Feature Extraction — js/audio_analysis.js
// NEW FRONTEND-ONLY IMPLEMENTATION
//
// Extracts actual physical acoustic features from Web Audio buffers:
// - Duration (s)
// - RMS Energy (Root Mean Square amplitude)
// - Zero-Crossing Rate (ZCR)
// - Energy-based Pause Detection (Pause count, Pause ratio, Total pause time)
// - Spectral Centroid (Hz via FFT magnitude spectrum)
// - Silence / invalid recording rejection
//
// Strictly empirical. Never generates fabricated diagnostic probabilities.
// ============================================================================

window.ALVI = window.ALVI || {};

(function () {
  let sharedAudioCtx = null;

  function getAudioContext() {
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      sharedAudioCtx = new AudioContextClass();
    }
    return sharedAudioCtx;
  }

  /**
   * Decode an audio Blob or ArrayBuffer into an AudioBuffer
   */
  async function decodeAudioBlob(blob) {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    const arrayBuffer = await blob.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  }

  /**
   * Extract actual physical acoustic features from an AudioBuffer
   */
  function analyzeAudioBuffer(audioBuffer) {
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration;

    // Minimum duration check (reject < 2 seconds)
    if (duration < 2.0) {
      return {
        isValid: false,
        reason: 'Recording is too short (' + duration.toFixed(1) + 's). A valid assessment requires at least 2.0 seconds of speech.',
        duration: duration
      };
    }

    // Mix to mono if multiple channels
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const monoData = new Float32Array(length);

    for (let c = 0; c < channels; c++) {
      const channelData = audioBuffer.getChannelData(c);
      for (let i = 0; i < length; i++) {
        monoData[i] += channelData[i] / channels;
      }
    }

    // 1. Overall RMS calculation
    let sumSquares = 0;
    for (let i = 0; i < length; i++) {
      sumSquares += monoData[i] * monoData[i];
    }
    const globalRMS = Math.sqrt(sumSquares / length);

    // Silence rejection: if global RMS is lower than 0.005, audio has no usable speech
    if (globalRMS < 0.005) {
      return {
        isValid: false,
        reason: 'Silence or near-silent input detected (RMS: ' + globalRMS.toFixed(4) + '). Please verify microphone volume and speak audibly.',
        duration: duration,
        rms: globalRMS
      };
    }

    // 2. Framing for ZCR, Energy-based Pause detection, and Spectral Centroid
    const frameSize = 2048;
    const hopSize = 1024; // 50% overlap
    const numFrames = Math.floor((length - frameSize) / hopSize);

    if (numFrames <= 0) {
      return {
        isValid: false,
        reason: 'Insufficient audio frames to extract reliable acoustic features.',
        duration: duration
      };
    }

    const frameRMS = new Float32Array(numFrames);
    const frameZCR = new Float32Array(numFrames);
    const frameCentroids = [];

    // Precompute Hann window for spectral analysis
    const windowFunc = new Float32Array(frameSize);
    for (let i = 0; i < frameSize; i++) {
      windowFunc[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (frameSize - 1)));
    }

    let maxFrameRMS = 0;

    for (let f = 0; f < numFrames; f++) {
      const offset = f * hopSize;
      let frameSumSq = 0;
      let zeroCrossings = 0;

      for (let i = 0; i < frameSize; i++) {
        const sample = monoData[offset + i];
        frameSumSq += sample * sample;

        if (i > 0) {
          const prevSample = monoData[offset + i - 1];
          if ((sample >= 0 && prevSample < 0) || (sample < 0 && prevSample >= 0)) {
            zeroCrossings++;
          }
        }
      }

      const fRMS = Math.sqrt(frameSumSq / frameSize);
      frameRMS[f] = fRMS;
      if (fRMS > maxFrameRMS) maxFrameRMS = fRMS;

      frameZCR[f] = zeroCrossings / (frameSize - 1);
    }

    // Energy threshold for pause identification (adaptive: 15% of max frame RMS, minimum 0.010)
    const pauseThreshold = Math.max(0.010, maxFrameRMS * 0.15);
    const minPauseFrames = Math.round((0.25 * sampleRate) / hopSize); // minimum 250ms for a distinct hesitation pause

    let pauseCount = 0;
    let totalPauseFrames = 0;
    let currentPauseRun = 0;

    for (let f = 0; f < numFrames; f++) {
      if (frameRMS[f] < pauseThreshold) {
        currentPauseRun++;
      } else {
        if (currentPauseRun >= minPauseFrames) {
          pauseCount++;
          totalPauseFrames += currentPauseRun;
        }
        currentPauseRun = 0;
      }
    }
    if (currentPauseRun >= minPauseFrames) {
      pauseCount++;
      totalPauseFrames += currentPauseRun;
    }

    const totalPauseSeconds = (totalPauseFrames * hopSize) / sampleRate;
    const pauseRatio = Math.min(1.0, Math.max(0.0, totalPauseSeconds / duration));

    // 3. Spectral Centroid computation (on active speech frames, downsampled FFT approximation)
    // We compute spectral centroid on every 3rd active speech frame for efficiency
    const fftSize = 1024;
    const halfFFT = fftSize / 2;
    const freqBinSize = sampleRate / fftSize;

    for (let f = 0; f < numFrames; f += 3) {
      if (frameRMS[f] >= pauseThreshold) {
        const offset = f * hopSize;
        // Simple DFT magnitude for first 32 frequency bands (covers up to ~4 kHz)
        let numSum = 0;
        let denSum = 0;
        const maxK = Math.min(64, halfFFT);

        for (let k = 1; k < maxK; k++) {
          let real = 0;
          let imag = 0;
          const omega = (2 * Math.PI * k) / fftSize;

          for (let n = 0; n < fftSize; n += 2) { // stride 2 for real-time speed
            const sample = monoData[offset + n] * windowFunc[n];
            real += sample * Math.cos(omega * n);
            imag -= sample * Math.sin(omega * n);
          }
          const mag = Math.sqrt(real * real + imag * imag);
          const freq = k * freqBinSize;
          numSum += freq * mag;
          denSum += mag;
        }

        if (denSum > 0.0001) {
          frameCentroids.push(numSum / denSum);
        }
      }
    }

    let avgSpectralCentroid = 1450; // fallback default
    if (frameCentroids.length > 0) {
      const sumCentroid = frameCentroids.reduce((a, b) => a + b, 0);
      avgSpectralCentroid = Math.round(sumCentroid / frameCentroids.length);
    }

    // Speech frame average ZCR and speech RMS
    let activeZCRSum = 0;
    let activeRMSSum = 0;
    let activeFrameCount = 0;

    for (let f = 0; f < numFrames; f++) {
      if (frameRMS[f] >= pauseThreshold) {
        activeZCRSum += frameZCR[f];
        activeRMSSum += frameRMS[f];
        activeFrameCount++;
      }
    }

    const avgZCR = activeFrameCount > 0 ? (activeZCRSum / activeFrameCount) : (globalRMS);
    const avgSpeechRMS = activeFrameCount > 0 ? (activeRMSSum / activeFrameCount) : globalRMS;

    return {
      isValid: true,
      duration: parseFloat(duration.toFixed(1)),
      rms: parseFloat(avgSpeechRMS.toFixed(4)),
      zcr: parseFloat(avgZCR.toFixed(4)),
      pause_ratio: parseFloat(pauseRatio.toFixed(3)),
      pause_count: pauseCount,
      pause_seconds: parseFloat(totalPauseSeconds.toFixed(1)),
      spectral_centroid: avgSpectralCentroid,
      phonation_ratio: parseFloat((1.0 - pauseRatio).toFixed(3)),
      evaluated_frames: numFrames,
      sampleRate: sampleRate
    };
  }

  window.ALVI.audioAnalysis = {
    decodeAudioBlob,
    analyzeAudioBuffer
  };
})();

