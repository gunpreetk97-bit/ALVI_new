/**
 * ALVI — Timmy Interactive Welcome Companion
 * Lightweight, vanilla JavaScript for pupil tracking, mood interaction, and accessibility.
 */

(function () {
  'use strict';

  // ── Mood Data & Empathetic Non-Diagnostic Responses ──────────────────────
  const MOOD_DATA = {
    happy: {
      label: 'Happy',
      response: "Glad to hear that! Positive energy brings wonderful clarity to your day.",
      mouthPath: "M 88,168 Q 100,186 112,168" // Broad warm smile
    },
    calm: {
      label: 'Calm',
      response: "A calm, centered breath is the perfect place to begin.",
      mouthPath: "M 90,172 Q 100,180 110,172" // Serene gentle curve
    },
    tired: {
      label: 'Tired',
      response: "Take it gently today. There is no rush at all.",
      mouthPath: "M 92,174 Q 100,177 108,174" // Soft resting curve
    },
    sad: {
      label: 'Sad',
      response: "Thank you for sharing. We're here with you, at your own gentle pace.",
      mouthPath: "M 91,176 Q 100,171 109,176" // Gentle compassionate curve
    },
    anxious: {
      label: 'Anxious',
      response: "Take a slow, deep breath. There are no right or wrong answers here.",
      mouthPath: "M 91,173 Q 96,170 100,174 Q 105,171 109,173" // Soft thoughtful wavy curve
    },
    okay: {
      label: 'Okay',
      response: "Steady and balanced. Let's take today's journey together.",
      mouthPath: "M 91,172 Q 100,176 109,172" // Content balanced curve
    }
  };

  const DEFAULT_MOUTH_PATH = "M 90,172 Q 100,180 110,172";

  document.addEventListener('DOMContentLoaded', () => {
    const stage = document.getElementById('timmy-stage');
    const leftPupil = document.getElementById('timmy-pupil-left');
    const rightPupil = document.getElementById('timmy-pupil-right');
    const mouth = document.getElementById('timmy-mouth');
    const responseEl = document.getElementById('timmy-response');
    const moodButtons = document.querySelectorAll('.timmy-mood-btn');
    const continueBtn = document.getElementById('timmy-continue-btn');

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isReducedMotion = reducedMotionQuery.matches;
    reducedMotionQuery.addEventListener('change', (e) => {
      isReducedMotion = e.matches;
    });

    // ── Eye Tracking Logic ───────────────────────────────────────────────────
    // Center positions in SVG coordinate space
    const LEFT_EYE_SVG_CENTER = { x: 74, y: 128 };
    const RIGHT_EYE_SVG_CENTER = { x: 126, y: 128 };

    // Maximum pupil travel inside the oval eyes (keeps pupil strictly inside the eye)
    const MAX_PUPIL_RADIUS_X = 8.5;
    const MAX_PUPIL_RADIUS_Y = 12.0;

    let targetLeftOffset = { x: 0, y: 0 };
    let targetRightOffset = { x: 0, y: 0 };
    let currentLeftOffset = { x: 0, y: 0 };
    let currentRightOffset = { x: 0, y: 0 };
    let rafId = null;

    function calculatePupilOffset(eyeSvgCenter, pointerClientX, pointerClientY) {
      if (!stage) return { x: 0, y: 0 };

      // Convert SVG eye center to screen coordinates
      const stageRect = stage.getBoundingClientRect();
      const scaleX = stageRect.width / 200; // viewBox width is 200
      const scaleY = stageRect.height / 220; // viewBox height is 220

      const eyeScreenX = stageRect.left + eyeSvgCenter.x * scaleX;
      const eyeScreenY = stageRect.top + eyeSvgCenter.y * scaleY;

      const deltaX = pointerClientX - eyeScreenX;
      const deltaY = pointerClientY - eyeScreenY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance < 1) {
        return { x: 0, y: 0 };
      }

      const angle = Math.atan2(deltaY, deltaX);

      // Distance dampening: subtle look when pointer is close, reaches max look at 240px
      const dampFactor = Math.min(1.0, distance / 240);

      // Constrain inside elliptical eye boundary
      const offsetX = Math.cos(angle) * MAX_PUPIL_RADIUS_X * dampFactor;
      const offsetY = Math.sin(angle) * MAX_PUPIL_RADIUS_Y * dampFactor;

      return { x: offsetX, y: offsetY };
    }

    function updatePupilTargets(clientX, clientY) {
      if (isReducedMotion) {
        targetLeftOffset = { x: 0, y: 0 };
        targetRightOffset = { x: 0, y: 0 };
        return;
      }
      targetLeftOffset = calculatePupilOffset(LEFT_EYE_SVG_CENTER, clientX, clientY);
      targetRightOffset = calculatePupilOffset(RIGHT_EYE_SVG_CENTER, clientX, clientY);
    }

    // Smooth animation loop using linear interpolation (lerp)
    function animatePupils() {
      if (!isReducedMotion) {
        const ease = 0.18; // Smooth, natural eye movement
        currentLeftOffset.x += (targetLeftOffset.x - currentLeftOffset.x) * ease;
        currentLeftOffset.y += (targetLeftOffset.y - currentLeftOffset.y) * ease;
        currentRightOffset.x += (targetRightOffset.x - currentRightOffset.x) * ease;
        currentRightOffset.y += (targetRightOffset.y - currentRightOffset.y) * ease;

        if (leftPupil) {
          leftPupil.setAttribute(
            'transform',
            `translate(${currentLeftOffset.x.toFixed(2)}, ${currentLeftOffset.y.toFixed(2)})`
          );
        }
        if (rightPupil) {
          rightPupil.setAttribute(
            'transform',
            `translate(${currentRightOffset.x.toFixed(2)}, ${currentRightOffset.y.toFixed(2)})`
          );
        }
      }
      rafId = requestAnimationFrame(animatePupils);
    }

    // Start pupil render loop
    rafId = requestAnimationFrame(animatePupils);

    // Mouse & Touch Tracking Listeners
    window.addEventListener('pointermove', (event) => {
      updatePupilTargets(event.clientX, event.clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (event) => {
      if (event.touches && event.touches[0]) {
        updatePupilTargets(event.touches[0].clientX, event.touches[0].clientY);
      }
    }, { passive: true });

    // When mouse leaves the window, eyes return gently to center
    document.addEventListener('mouseleave', () => {
      targetLeftOffset = { x: 0, y: 0 };
      targetRightOffset = { x: 0, y: 0 };
    });

    // ── Natural Blinking Mechanism ───────────────────────────────────────────
    let blinkTimeout = null;

    function scheduleNextBlink() {
      if (isReducedMotion) return;
      // Random blink interval between 3.5s and 6.5s
      const delay = 3500 + Math.random() * 3000;
      blinkTimeout = setTimeout(() => {
        if (stage && !isReducedMotion) {
          stage.classList.add('blinking');
          setTimeout(() => {
            stage.classList.remove('blinking');
            scheduleNextBlink();
          }, 160); // 160ms blink duration
        } else {
          scheduleNextBlink();
        }
      }, delay);
    }

    scheduleNextBlink();

    // ── Mood Selection Interaction ───────────────────────────────────────────
    let selectedMood = null;

    moodButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const moodKey = btn.getAttribute('data-mood');
        const moodInfo = MOOD_DATA[moodKey];
        if (!moodInfo) return;

        selectedMood = moodKey;

        // 1. Update button selection states and ARIA attributes
        moodButtons.forEach((b) => {
          const isSelected = b === btn;
          b.classList.toggle('selected', isSelected);
          b.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        });

        // 2. Display gentle, non-diagnostic response
        if (responseEl) {
          responseEl.textContent = moodInfo.response;
          responseEl.classList.remove('visible');
          // Trigger reflow to restart fade-in transition cleanly
          void responseEl.offsetWidth;
          responseEl.classList.add('visible');
        }

        // 3. Subtle hand-drawn mouth adjustment
        if (mouth && moodInfo.mouthPath) {
          mouth.setAttribute('d', moodInfo.mouthPath);
        }

        // 4. Reveal & activate "Continue to Dashboard" button
        if (continueBtn) {
          continueBtn.classList.add('active');
          continueBtn.focus();
        }

        // 5. Store selected mood in sessionStorage for optional session context
        try {
          sessionStorage.setItem('alvi_user_mood', moodKey);
          sessionStorage.setItem('alvi_mood_timestamp', new Date().toISOString());
        } catch (_) {
          // Ignore storage restrictions if disabled
        }
      });
    });

    // Clean up animation on page unload
    window.addEventListener('beforeunload', () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (blinkTimeout) clearTimeout(blinkTimeout);
    });
  });
})();

