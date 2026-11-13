/**
 * ALVI — Timmy Interactive Welcome Companion
 * Abstract hand-drawn character logic: smooth eye tracking, blinking, mood reaction, and accessibility.
 */

(function () {
  'use strict';

  // ── Mood Data, Empathetic Responses & Subtle Mouth Curves ─────────────────
  const MOOD_DATA = {
    happy: {
      label: 'Happy',
      response: "Glad to hear that! Positive energy brings wonderful clarity to your day.",
      mouthPath: "M 102,152 Q 108,160 114,152" // Tiny pleasant smile
    },
    calm: {
      label: 'Calm',
      response: "A calm, centered breath is the perfect place to begin.",
      mouthPath: "M 103,153 Q 108,157 113,153" // Calm serene curve
    },
    tired: {
      label: 'Tired',
      response: "Take it gently today. There is no rush at all.",
      mouthPath: "M 104,155 L 112,155" // Tiny soft resting dash
    },
    sad: {
      label: 'Sad',
      response: "Thank you for sharing. We're here with you, at your own gentle pace.",
      mouthPath: "M 103,156 Q 108,153 113,156" // Gentle compassionate curve
    },
    anxious: {
      label: 'Anxious',
      response: "Take a slow, deep breath. There are no right or wrong answers here.",
      mouthPath: "M 103,154 Q 106,152 108,155 Q 111,153 113,154" // Soft thoughtful wave
    },
    okay: {
      label: 'Okay',
      response: "Steady and balanced. Let's take today's journey together.",
      mouthPath: "M 104,153 Q 108,156 112,153" // Soft balanced curve
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const stage = document.getElementById('timmy-stage');
    const leftPupil = document.getElementById('timmy-pupil-left');
    const rightPupil = document.getElementById('timmy-pupil-right');
    const mouth = document.getElementById('timmy-mouth');
    const responseEl = document.getElementById('timmy-response');
    const moodButtons = document.querySelectorAll('.timmy-mood-btn');
    const continueBtn = document.getElementById('timmy-continue-btn');

    // Accessibility check: prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isReducedMotion = reducedMotionQuery.matches;
    reducedMotionQuery.addEventListener('change', (e) => {
      isReducedMotion = e.matches;
      if (isReducedMotion) {
        resetPupilsImmediately();
      }
    });

    // ── Eye Tracking Logic ───────────────────────────────────────────────────
    // SVG centers in 220x220 viewBox
    const LEFT_EYE_SVG_CENTER = { x: 80, y: 108 };
    const RIGHT_EYE_SVG_CENTER = { x: 136, y: 111 };

    // Strict boundary limits: keeps tiny pupils completely inside oversized oval eyes
    const MAX_PUPIL_RADIUS_X = 8.5;
    const MAX_PUPIL_RADIUS_Y = 13.5;

    let targetLeftOffset = { x: 0, y: 0 };
    let targetRightOffset = { x: 0, y: 0 };
    let currentLeftOffset = { x: 0, y: 0 };
    let currentRightOffset = { x: 0, y: 0 };
    let rafId = null;

    function calculateOffset(eyeCenter, clientX, clientY) {
      if (!stage) return { x: 0, y: 0 };

      const stageRect = stage.getBoundingClientRect();
      const scaleX = stageRect.width / 220;
      const scaleY = stageRect.height / 220;

      const eyeScreenX = stageRect.left + eyeCenter.x * scaleX;
      const eyeScreenY = stageRect.top + eyeCenter.y * scaleY;

      const deltaX = clientX - eyeScreenX;
      const deltaY = clientY - eyeScreenY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance < 1) {
        return { x: 0, y: 0 };
      }

      const angle = Math.atan2(deltaY, deltaX);

      // Distance dampening: subtle look when pointer is near, reaches max look at ~220px
      const dampFactor = Math.min(1.0, distance / 220);

      const offsetX = Math.cos(angle) * MAX_PUPIL_RADIUS_X * dampFactor;
      const offsetY = Math.sin(angle) * MAX_PUPIL_RADIUS_Y * dampFactor;

      return { x: offsetX, y: offsetY };
    }

    function updatePupilTargets(clientX, clientY) {
      if (isReducedMotion) return;
      targetLeftOffset = calculateOffset(LEFT_EYE_SVG_CENTER, clientX, clientY);
      targetRightOffset = calculateOffset(RIGHT_EYE_SVG_CENTER, clientX, clientY);
    }

    function resetPupilsImmediately() {
      targetLeftOffset = { x: 0, y: 0 };
      targetRightOffset = { x: 0, y: 0 };
      currentLeftOffset = { x: 0, y: 0 };
      currentRightOffset = { x: 0, y: 0 };
      if (leftPupil) leftPupil.setAttribute('transform', 'translate(0, 0)');
      if (rightPupil) rightPupil.setAttribute('transform', 'translate(0, 0)');
    }

    // Smooth render loop using linear interpolation
    function renderPupils() {
      if (!isReducedMotion) {
        const ease = 0.16; // Buttery, natural eye movement
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
      rafId = requestAnimationFrame(renderPupils);
    }

    rafId = requestAnimationFrame(renderPupils);

    // Pointer and Touch Tracking Listeners
    window.addEventListener('pointermove', (event) => {
      updatePupilTargets(event.clientX, event.clientY);
    }, { passive: true });

    window.addEventListener('touchstart', (event) => {
      if (event.touches && event.touches[0]) {
        updatePupilTargets(event.touches[0].clientX, event.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (event) => {
      if (event.touches && event.touches[0]) {
        updatePupilTargets(event.touches[0].clientX, event.touches[0].clientY);
      }
    }, { passive: true });

    // When cursor/touch leaves, eyes gently return to center
    document.addEventListener('mouseleave', () => {
      targetLeftOffset = { x: 0, y: 0 };
      targetRightOffset = { x: 0, y: 0 };
    });

    window.addEventListener('touchend', () => {
      targetLeftOffset = { x: 0, y: 0 };
      targetRightOffset = { x: 0, y: 0 };
    });

    // ── Natural Periodic Blinking ────────────────────────────────────────────
    let blinkTimer = null;

    function scheduleBlink() {
      if (isReducedMotion) return;
      // Natural interval between 4.0s and 6.8s
      const nextDelay = 4000 + Math.random() * 2800;
      blinkTimer = setTimeout(() => {
        if (stage && !isReducedMotion) {
          stage.classList.add('blinking');
          setTimeout(() => {
            stage.classList.remove('blinking');
            scheduleBlink();
          }, 140); // 140ms gentle blink
        } else {
          scheduleBlink();
        }
      }, nextDelay);
    }

    scheduleBlink();

    // ── Mood Selection Interaction & Reaction Bounce ─────────────────────────
    moodButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const moodKey = btn.getAttribute('data-mood');
        const moodInfo = MOOD_DATA[moodKey];
        if (!moodInfo) return;

        // 1. Highlight button and update ARIA states
        moodButtons.forEach((b) => {
          const isSelected = b === btn;
          b.classList.toggle('selected', isSelected);
          b.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        });

        // 2. Timmy reaction animation (gentle playful bounce/squish)
        if (stage && !isReducedMotion) {
          stage.classList.remove('reacting');
          void stage.offsetWidth; // Force reflow to restart keyframe
          stage.classList.add('reacting');
        }

        // 3. Subtle mouth adjustment
        if (mouth && moodInfo.mouthPath) {
          mouth.setAttribute('d', moodInfo.mouthPath);
        }

        // 4. Display gentle, non-diagnostic response
        if (responseEl) {
          responseEl.textContent = moodInfo.response;
          responseEl.classList.remove('visible');
          void responseEl.offsetWidth; // Force reflow
          responseEl.classList.add('visible');
        }

        // 5. Reveal & activate "Continue to Dashboard" button
        if (continueBtn) {
          continueBtn.classList.add('active');
        }

        // 6. Save mood in sessionStorage
        try {
          sessionStorage.setItem('alvi_user_mood', moodKey);
          sessionStorage.setItem('alvi_mood_timestamp', new Date().toISOString());
        } catch (_) {
          // Ignore storage restrictions
        }
      });
    });

    // Clean up animation on unload
    window.addEventListener('beforeunload', () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (blinkTimer) clearTimeout(blinkTimer);
    });
  });
})();
