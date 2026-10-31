// Story Recall Script
// Waveform: real mic via Web Audio API AnalyserNode (bar style).
// Playback: MediaRecorder captures audio; object URL presented after stop.

document.addEventListener('DOMContentLoaded', () => {

  // ── Story read-aloud (TTS) ────────────────────────────────────────────────
  const playStoryAudioBtn = document.getElementById('play-story-audio-btn');
  const audioPlayIcon     = document.getElementById('audio-play-icon');
  const audioPlayText     = document.getElementById('audio-play-text');

  let isPlayingTTS = false;

  if (playStoryAudioBtn) {
    playStoryAudioBtn.addEventListener('click', () => {
      if (!isPlayingTTS) {
        isPlayingTTS = true;
        if (audioPlayIcon) audioPlayIcon.textContent = '⏸';
        if (audioPlayText) audioPlayText.textContent = 'Playing Story...';

        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(
            'One rainy morning, Aarav left his home carrying a blue umbrella. ' +
            'He walked to the local market and bought three red apples. ' +
            'On his way back, he met his friend Meera and gave her one apple before returning home.'
          );
          utterance.rate = 0.9;
          utterance.onend = () => {
            isPlayingTTS = false;
            if (audioPlayIcon) audioPlayIcon.textContent = '▶';
            if (audioPlayText) audioPlayText.textContent = 'Listen to Story';
          };
          window.speechSynthesis.speak(utterance);
        } else {
          setTimeout(() => {
            isPlayingTTS = false;
            if (audioPlayIcon) audioPlayIcon.textContent = '▶';
            if (audioPlayText) audioPlayText.textContent = 'Listen to Story';
          }, 8000);
        }
      } else {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        isPlayingTTS = false;
        if (audioPlayIcon) audioPlayIcon.textContent = '▶';
        if (audioPlayText) audioPlayText.textContent = 'Listen to Story';
      }
    });
  }

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const recordStoryBtn    = document.getElementById('record-story-btn');
  const storyRecordStatus = document.getElementById('story-record-status');
  const storyTimer        = document.getElementById('story-timer');
  const toMindplayBtn     = document.getElementById('to-mindplay-btn');
  const storyCanvas       = document.getElementById('story-waveform-canvas');

  if (!storyCanvas) return;
  const storyCtx = storyCanvas.getContext('2d');

  // ── State ─────────────────────────────────────────────────────────────────
  let isRecordingStory    = false;
  let storyTimerInterval  = null;
  let storyElapsed        = 0;
  let animFrameId         = null;

  // Web Audio API
  let audioCtx   = null;
  let analyser   = null;
  let micSource  = null;
  let micStream  = null;
  let dataArray  = null;

  // MediaRecorder
  let mediaRecorder  = null;
  let recordedChunks = [];
  let playbackURL    = null;

  // ── Playback element (injected into the dark recording panel) ─────────────
  const playbackContainer = document.createElement('div');
  playbackContainer.id    = 'story-playback-container';
  playbackContainer.className = 'hidden flex items-center gap-3';
  playbackContainer.innerHTML =
    '<span class="text-xs text-emerald-400 font-semibold">▶ Your retell:</span>' +
    '<audio id="story-playback-audio" controls class="h-8 rounded-lg" style="max-width:220px;filter:invert(1) hue-rotate(270deg) brightness(0.85)"></audio>';

  // Insert after the status span, inside the dark panel's flex row
  const storyBtnRow = recordStoryBtn ? recordStoryBtn.parentNode : null;
  if (storyBtnRow) {
    storyBtnRow.parentNode.insertBefore(playbackContainer, storyBtnRow.nextSibling);
  }
  const playbackAudio = document.getElementById('story-playback-audio');

  // ── Canvas: stamp pixel dimensions every frame ────────────────────────────
  function stampCanvas() {
    const parent = storyCanvas.parentElement;
    const w = parent ? parent.clientWidth  : storyCanvas.offsetWidth;
    const h = parent ? parent.clientHeight : storyCanvas.offsetHeight;
    if (w > 0 && storyCanvas.width  !== w) storyCanvas.width  = w;
    if (h > 0 && storyCanvas.height !== h) storyCanvas.height = h;
  }

  // ── Idle bar baseline ─────────────────────────────────────────────────────
  function drawIdle() {
    stampCanvas();
    if (storyCanvas.width === 0 || storyCanvas.height === 0) return;
    storyCtx.clearRect(0, 0, storyCanvas.width, storyCanvas.height);
    const bars    = 45;
    const barW    = (storyCanvas.width / bars) - 2;
    const centerY = storyCanvas.height / 2;
    storyCtx.fillStyle = '#334155';
    for (let i = 0; i < bars; i++) {
      const x = i * (barW + 2);
      const h = 3;
      storyCtx.beginPath();
      if (storyCtx.roundRect) storyCtx.roundRect(x, centerY - h / 2, barW, h, 2);
      else storyCtx.rect(x, centerY - h / 2, barW, h);
      storyCtx.fill();
    }
  }

  drawIdle();

  // ── Live waveform loop (frequency bars, purple for story retell) ──────────
  function drawLiveWaveform() {
    if (!isRecordingStory || !analyser) return;
    animFrameId = requestAnimationFrame(drawLiveWaveform);

    stampCanvas();
    const W = storyCanvas.width;
    const H = storyCanvas.height;
    if (W === 0 || H === 0) return;

    analyser.getByteFrequencyData(dataArray);
    storyCtx.clearRect(0, 0, W, H);

    const bars    = 45;
    const barW    = (W / bars) - 2;
    const centerY = H / 2;

    for (let i = 0; i < bars; i++) {
      const binIndex = Math.floor(i * dataArray.length / bars);
      const amplitude = dataArray[binIndex] / 255;
      const h = Math.max(3, amplitude * H * 0.85);
      const x = i * (barW + 2);
      const y = centerY - h / 2;

      storyCtx.fillStyle = '#A855F7';   // purple — distinct from voice (indigo)
      storyCtx.beginPath();
      if (storyCtx.roundRect) storyCtx.roundRect(x, y, barW, h, 2);
      else storyCtx.rect(x, y, barW, h);
      storyCtx.fill();
    }
  }

  // ── Start retell recording ────────────────────────────────────────────────
  async function startStoryRecording() {
    isRecordingStory = false;
    storyElapsed     = 0;
    if (storyTimer) storyTimer.textContent = '0:00 / 0:45';

    // ── Session: clear any previously saved Story result so that a re-take
    // does not leave a stale "completed: true" from the previous attempt.
    // This is the Story equivalent of Retry — the user clicked Record Retell
    // again after already recording once. Voice and MindPlay data are
    // untouched because saveStory() only merges the story namespace.
    if (window.ALVI && window.ALVI.session) {
      window.ALVI.session.saveStory({ completed: false, durationSeconds: 0 });
    }

    if (recordStoryBtn) recordStoryBtn.textContent = '⏳ Requesting mic…';
    if (storyRecordStatus) {
      storyRecordStatus.textContent = 'Waiting for microphone permission…';
      storyRecordStatus.className   = 'text-xs text-slate-400';
    }
    playbackContainer.classList.add('hidden');

    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') await audioCtx.resume();

      analyser = audioCtx.createAnalyser();
      analyser.fftSize               = 256;
      analyser.smoothingTimeConstant = 0.75;

      micSource = audioCtx.createMediaStreamSource(micStream);
      micSource.connect(analyser);

      dataArray = new Uint8Array(analyser.frequencyBinCount);

      // MediaRecorder for playback blob
      recordedChunks = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      mediaRecorder = new MediaRecorder(micStream, { mimeType });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        if (recordedChunks.length > 0) {
          const blob = new Blob(recordedChunks, { type: mimeType });
          if (playbackURL) URL.revokeObjectURL(playbackURL);
          playbackURL = URL.createObjectURL(blob);
          if (playbackAudio) {
            playbackAudio.src = playbackURL;
            playbackAudio.load();
          }
          playbackContainer.classList.remove('hidden');

          // ── Session: mark Story Recall as completed.
          // Saved here — inside onstop — only after MediaRecorder has
          // genuinely finished and the Blob is confirmed non-empty.
          // storyElapsed holds the actual number of seconds recorded.
          // No audio data or Blob URLs are written to sessionStorage.
          if (window.ALVI && window.ALVI.session) {
            window.ALVI.session.saveStory({
              completed:       true,
              durationSeconds: storyElapsed
            });
          }
        }
      };

      mediaRecorder.start(100);

      isRecordingStory = true;
      animFrameId = requestAnimationFrame(drawLiveWaveform);

      if (recordStoryBtn) recordStoryBtn.textContent = '⏹ Stop Retell';
      if (storyRecordStatus) {
        storyRecordStatus.textContent = 'Recording retell… Speaking key story elements.';
        storyRecordStatus.className   = 'text-xs text-purple-400 font-semibold animate-pulse';
      }

      storyTimerInterval = setInterval(() => {
        storyElapsed++;
        const mins = Math.floor(storyElapsed / 60);
        const secs = (storyElapsed % 60).toString().padStart(2, '0');
        if (storyTimer) storyTimer.textContent = `${mins}:${secs} / 0:45`;
        if (storyElapsed >= 45) stopStoryRecording();
      }, 1000);

    } catch (err) {
      isRecordingStory = false;
      if (recordStoryBtn) recordStoryBtn.textContent = '🎙 Record Retell';
      if (storyRecordStatus) {
        const msg = err.name === 'NotAllowedError'
          ? 'Microphone access was denied. Please allow permission and try again.'
          : 'Microphone unavailable. Please check your device settings.';
        storyRecordStatus.textContent = msg;
        storyRecordStatus.className   = 'text-xs text-red-400 font-semibold';
      }
      drawIdle();
    }
  }

  // ── Stop retell recording ─────────────────────────────────────────────────
  function stopStoryRecording() {
    isRecordingStory = false;
    clearInterval(storyTimerInterval);

    if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }

    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();

    if (micSource) { try { micSource.disconnect(); } catch (_) {} micSource = null; }
    if (analyser)  { try { analyser.disconnect();  } catch (_) {} analyser  = null; }
    if (audioCtx)  { try { audioCtx.close();       } catch (_) {} audioCtx  = null; }
    if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }

    dataArray = null;
    drawIdle();

    if (recordStoryBtn) recordStoryBtn.textContent = '✓ Retell Captured';
    if (storyRecordStatus) {
      storyRecordStatus.textContent = 'Retell captured. Listen back or continue to MindPlay.';
      storyRecordStatus.className   = 'text-xs text-emerald-400 font-bold';
    }
  }

  // ── Button wiring ─────────────────────────────────────────────────────────
  if (recordStoryBtn) {
    recordStoryBtn.addEventListener('click', () => {
      if (!isRecordingStory) startStoryRecording();
      else                   stopStoryRecording();
    });
  }

  if (toMindplayBtn) {
    toMindplayBtn.addEventListener('click', () => {
      if (isRecordingStory) stopStoryRecording();
      if (playbackURL) { URL.revokeObjectURL(playbackURL); playbackURL = null; }
      window.location.href = 'mindplay.html';
    });
  }

});
