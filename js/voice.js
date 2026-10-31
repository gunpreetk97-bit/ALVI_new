// Voice Description & Check-in Flow Script
// Waveform: real mic via Web Audio API AnalyserNode (bar style, matches story page).
// Playback: MediaRecorder captures audio; object URL presented after stop.

document.addEventListener('DOMContentLoaded', () => {

  // ── Section visibility toggle ─────────────────────────────────────────────
  const beginCheckinFlowBtn     = document.getElementById('begin-checkin-flow-btn');
  const todayOverviewSection    = document.getElementById('page-today-checkin');
  const voiceDescriptionSection = document.getElementById('page-voice-description');

  if (beginCheckinFlowBtn && todayOverviewSection && voiceDescriptionSection) {
    beginCheckinFlowBtn.addEventListener('click', () => {
      todayOverviewSection.classList.add('hidden');
      voiceDescriptionSection.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // ── Session: start a fresh check-in session when the user
      // deliberately begins. This is the only place init() is called so
      // that returning to this page via the sidebar does NOT wipe a
      // session that is already in progress.
      if (window.ALVI && window.ALVI.session) {
        window.ALVI.session.init();
      }
    });
  }

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const toggleRecordBtn   = document.getElementById('toggle-record-btn');
  const recordIcon        = document.getElementById('record-icon');
  const recordBtnText     = document.getElementById('record-btn-text');
  const recordStatusText  = document.getElementById('record-status-text');
  const voiceTimerDisplay = document.getElementById('voice-timer-display');
  const toStoryRecallBtn  = document.getElementById('to-story-recall-btn');
  const resetRecordBtn    = document.getElementById('reset-record-btn');
  const canvas            = document.getElementById('voice-waveform-canvas');

  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // ── State ─────────────────────────────────────────────────────────────────
  let isRecording         = false;
  let voiceRecordingTimer = null;
  let voiceElapsedSeconds = 0;
  let animFrameId         = null;

  // Web Audio API — analysis only (NOT connected to destination, no echo)
  let audioCtx    = null;
  let analyser    = null;
  let micSource   = null;
  let micStream   = null;
  let dataArray   = null;

  // MediaRecorder — captures audio for playback
  let mediaRecorder   = null;
  let recordedChunks  = [];
  let playbackURL     = null;   // current object URL; revoked on reset

  // ── Playback element (injected once, hidden/shown) ────────────────────────
  // Insert a persistent <audio> element near the status text so it doesn't
  // get overwritten by status updates.
  const playbackContainer = document.createElement('div');
  playbackContainer.id    = 'voice-playback-container';
  playbackContainer.className = 'hidden flex items-center gap-3 pt-1';
  playbackContainer.innerHTML =
    '<span class="text-xs text-emerald-400 font-semibold">▶ Your recording:</span>' +
    '<audio id="voice-playback-audio" controls class="h-8 rounded-lg" style="max-width:240px;filter:invert(1) hue-rotate(210deg) brightness(0.9)"></audio>';

  // Insert after the record-status-text paragraph inside the dark panel
  if (recordStatusText && recordStatusText.parentNode) {
    recordStatusText.parentNode.insertBefore(playbackContainer, recordStatusText.nextSibling);
  }
  const playbackAudio = document.getElementById('voice-playback-audio');

  // ── Canvas: stamp real pixel dimensions at draw time ─────────────────────
  // Re-stamp every frame so resize events are automatically handled.
  function stampCanvas() {
    const parent = canvas.parentElement;
    const w = parent ? parent.clientWidth  : canvas.offsetWidth;
    const h = parent ? parent.clientHeight : canvas.offsetHeight;
    if (w > 0 && canvas.width  !== w) canvas.width  = w;
    if (h > 0 && canvas.height !== h) canvas.height = h;
  }

  // ── Idle baseline ─────────────────────────────────────────────────────────
  function drawIdle() {
    stampCanvas();
    if (canvas.width === 0 || canvas.height === 0) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bars   = 45;
    const barW   = (canvas.width / bars) - 2;
    const centerY = canvas.height / 2;
    ctx.fillStyle = '#334155';
    for (let i = 0; i < bars; i++) {
      const x = i * (barW + 2);
      const h = 3;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, centerY - h / 2, barW, h, 2);
      else ctx.rect(x, centerY - h / 2, barW, h);
      ctx.fill();
    }
  }

  drawIdle();

  // ── Live waveform — bar style matching Story Recall ───────────────────────
  // Uses getByteFrequencyData so bars react visibly to speech amplitude.
  function drawLiveWaveform() {
    if (!isRecording || !analyser) return;
    animFrameId = requestAnimationFrame(drawLiveWaveform);

    stampCanvas();
    const W = canvas.width;
    const H = canvas.height;
    if (W === 0 || H === 0) return;

    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, W, H);

    const bars  = 45;
    const barW  = (W / bars) - 2;
    const centerY = H / 2;

    for (let i = 0; i < bars; i++) {
      // Map frequency bins evenly across bar count
      const binIndex = Math.floor(i * dataArray.length / bars);
      const amplitude = dataArray[binIndex] / 255;   // 0–1

      // Minimum 3 px tall (silence baseline), scales to ~80% of half-height
      const h = Math.max(3, amplitude * H * 0.85);
      const x = i * (barW + 2);
      const y = centerY - h / 2;

      ctx.fillStyle = '#6366F1';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, barW, h, 2);
      else ctx.rect(x, y, barW, h);
      ctx.fill();
    }
  }

  // ── Start recording ───────────────────────────────────────────────────────
  async function startRecording() {
    isRecording = false;
    voiceElapsedSeconds = 0;
    if (voiceTimerDisplay) voiceTimerDisplay.textContent = '0:00 / 0:30';

    if (recordIcon)       recordIcon.textContent = '⏳';
    if (recordBtnText)    recordBtnText.textContent = 'Requesting mic…';
    if (recordStatusText) {
      recordStatusText.textContent = 'Waiting for microphone permission…';
      recordStatusText.className   = 'text-xs text-slate-400';
    }
    playbackContainer.classList.add('hidden');

    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      // ── Web Audio graph (analysis only) ───────────────────────────────────
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') await audioCtx.resume();

      analyser = audioCtx.createAnalyser();
      analyser.fftSize               = 256;   // 128 frequency bins — enough for bars
      analyser.smoothingTimeConstant = 0.75;

      micSource = audioCtx.createMediaStreamSource(micStream);
      micSource.connect(analyser);
      // NOT wired to destination → no loopback / echo

      dataArray = new Uint8Array(analyser.frequencyBinCount); // 128 bins

      // ── MediaRecorder (capture for playback) ──────────────────────────────
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

          // ── Session: mark Voice Description as completed.
          // Saved here — inside onstop — so we only record completion
          // after MediaRecorder has genuinely finished collecting data.
          // voiceElapsedSeconds holds the actual recorded duration.
          if (window.ALVI && window.ALVI.session) {
            window.ALVI.session.saveVoice({
              completed:       true,
              durationSeconds: voiceElapsedSeconds
            });
          }
        }
      };

      mediaRecorder.start(100); // collect data every 100 ms

      // ── Animation ─────────────────────────────────────────────────────────
      isRecording = true;
      animFrameId = requestAnimationFrame(drawLiveWaveform);

      // ── UI ────────────────────────────────────────────────────────────────
      if (recordIcon)       recordIcon.textContent = '⏹';
      if (recordBtnText)    recordBtnText.textContent = 'Stop Recording';
      if (recordStatusText) {
        recordStatusText.textContent = 'Recording in progress… Describe the scene aloud.';
        recordStatusText.className   = 'text-xs text-indigo-400 font-semibold animate-pulse';
      }
      if (resetRecordBtn)   resetRecordBtn.classList.remove('hidden');

      // 30-second timer
      voiceRecordingTimer = setInterval(() => {
        voiceElapsedSeconds++;
        const mins = Math.floor(voiceElapsedSeconds / 60);
        const secs = (voiceElapsedSeconds % 60).toString().padStart(2, '0');
        if (voiceTimerDisplay) voiceTimerDisplay.textContent = `${mins}:${secs} / 0:30`;
        if (voiceElapsedSeconds >= 30) stopRecording(true);
      }, 1000);

    } catch (err) {
      isRecording = false;
      if (recordIcon)       recordIcon.textContent = '🎙️';
      if (recordBtnText)    recordBtnText.textContent = 'Start Recording';
      if (recordStatusText) {
        const msg = err.name === 'NotAllowedError'
          ? 'Microphone access was denied. Please allow mic permission and try again.'
          : 'Microphone unavailable. Please check your device settings.';
        recordStatusText.textContent = msg;
        recordStatusText.className   = 'text-xs text-red-400 font-semibold';
      }
      drawIdle();
    }
  }

  // ── Stop recording ────────────────────────────────────────────────────────
  function stopRecording() {
    isRecording = false;
    clearInterval(voiceRecordingTimer);

    if (animFrameId)  { cancelAnimationFrame(animFrameId); animFrameId = null; }

    // Stop MediaRecorder (triggers onstop → playback URL creation)
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    // Release audio graph
    if (micSource) { try { micSource.disconnect(); } catch (_) {} micSource = null; }
    if (analyser)  { try { analyser.disconnect();  } catch (_) {} analyser  = null; }
    if (audioCtx)  { try { audioCtx.close();       } catch (_) {} audioCtx  = null; }

    // Stop mic tracks (after MediaRecorder has stopped so no data loss)
    if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }

    dataArray = null;
    drawIdle();

    if (recordIcon)       recordIcon.textContent = '✓';
    if (recordBtnText)    recordBtnText.textContent = 'Recording Complete';
    if (recordStatusText) {
      recordStatusText.textContent = 'Recording captured. Listen back or continue to Story Recall.';
      recordStatusText.className   = 'text-xs text-emerald-400 font-bold';
    }
  }

  // ── Reset / Retry ─────────────────────────────────────────────────────────
  function resetRecording() {
    isRecording = false;
    clearInterval(voiceRecordingTimer);
    if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    mediaRecorder  = null;
    recordedChunks = [];

    if (micSource) { try { micSource.disconnect(); } catch (_) {} micSource = null; }
    if (analyser)  { try { analyser.disconnect();  } catch (_) {} analyser  = null; }
    if (audioCtx)  { try { audioCtx.close();       } catch (_) {} audioCtx  = null; }
    if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
    dataArray = null;

    // Revoke old playback URL and hide player
    if (playbackURL) { URL.revokeObjectURL(playbackURL); playbackURL = null; }
    if (playbackAudio) { playbackAudio.src = ''; }
    playbackContainer.classList.add('hidden');

    // ── Session: reset only the Voice activity back to "not completed".
    // Uses saveVoice() — not init() — so Story Recall or MindPlay data
    // that may already be in the session is preserved untouched.
    if (window.ALVI && window.ALVI.session) {
      window.ALVI.session.saveVoice({ completed: false, durationSeconds: 0 });
    }

    voiceElapsedSeconds = 0;
    if (voiceTimerDisplay)  voiceTimerDisplay.textContent = '0:00 / 0:30';
    if (recordIcon)         recordIcon.textContent = '🎙️';
    if (recordBtnText)      recordBtnText.textContent = 'Start Recording';
    if (recordStatusText) {
      recordStatusText.textContent = 'Click to start recording your response aloud.';
      recordStatusText.className   = 'text-xs text-slate-400';
    }
    if (resetRecordBtn)     resetRecordBtn.classList.add('hidden');

    drawIdle();
  }

  // ── Button wiring ─────────────────────────────────────────────────────────
  if (toggleRecordBtn) {
    toggleRecordBtn.addEventListener('click', () => {
      if (!isRecording) startRecording();
      else              stopRecording();
    });
  }

  if (resetRecordBtn) {
    resetRecordBtn.addEventListener('click', resetRecording);
  }

  if (toStoryRecallBtn) {
    toStoryRecallBtn.addEventListener('click', () => {
      if (isRecording) stopRecording();
      // Revoke playback URL before navigating
      if (playbackURL) { URL.revokeObjectURL(playbackURL); playbackURL = null; }
      window.location.href = 'story.html';
    });
  }

});
