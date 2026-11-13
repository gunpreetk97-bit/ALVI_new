/**
 * ALVI — Timmy v3: Interactive Thinking Doodle
 *
 * Sequence on load:
 *   1. Outline draws itself (stroke-dashoffset animation, ~0.9s)
 *   2. Body fill fades in; mouth appears
 *   3. Eyes pop in with spring bounce
 *   4. Glance sequence: left → right → down (question) → up (thinking)
 *   5. Thought bubble appears with animated dots
 *   6. Pupils follow pointer; look toward hovered mood pill
 *   7. On mood select: Timmy looks up, thinks, responds
 *   8. Random blinks throughout
 *
 * Safety:
 *   - Respects prefers-reduced-motion throughout
 *   - No external dependencies
 *   - Modifies ONLY Timmy's own elements
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────────
     MOOD DATA
     Mouth paths are relative to viewBox "0 0 460 460".
     The mouth sits at ~y=340-348, centered around x=220.
  ───────────────────────────────────────────────────────────────────────── */
  const MOOD_DATA = {
    happy: {
      response: 'Glad to hear that! Positive energy brings wonderful clarity.',
      mouth:    'M 193,336 Q 220,352 247,336'   // wide upward smile
    },
    calm: {
      response: 'A calm, centered breath is the perfect place to begin.',
      mouth:    'M 196,340 Q 220,347 244,340'   // gentle curve
    },
    tired: {
      response: 'Take it gently today. There is absolutely no rush.',
      mouth:    'M 198,342 L 242,342'            // soft flat line
    },
    sad: {
      response: "Thank you for sharing. We're here with you, at your own pace.",
      mouth:    'M 196,344 Q 220,337 244,344'   // slight downward
    },
    anxious: {
      response: 'Take a slow, deep breath. No right or wrong answers here.',
      mouth:    'M 196,342 Q 207,338 220,343 Q 233,339 244,342' // soft wave
    },
    okay: {
      response: "Steady and balanced. Let's take today's journey together.",
      mouth:    'M 196,340 Q 220,346 244,340'   // balanced curve
    }
  };

  /* ─────────────────────────────────────────────────────────────────────────
     DOM REFS
  ───────────────────────────────────────────────────────────────────────── */
  const scene      = document.querySelector('.timmy-scene');
  const tSvg       = document.getElementById('timmy-svg');
  const bodyPath   = document.getElementById('timmy-body');
  const leftEye    = document.getElementById('timmy-left-eye');
  const rightEye   = document.getElementById('timmy-right-eye');
  const pupilL     = document.getElementById('timmy-pupil-l');
  const pupilR     = document.getElementById('timmy-pupil-r');
  const mouthEl    = document.getElementById('timmy-mouth');
  const thinkBbl   = document.getElementById('timmy-think');
  const responseEl = document.getElementById('timmy-response');
  const continueEl = document.getElementById('timmy-continue');
  const moodPills  = document.querySelectorAll('.mood-pill');

  /* ─────────────────────────────────────────────────────────────────────────
     EYE GEOMETRY
     Coordinates are in viewBox units (0 0 460 460).
     MAX values cap pupil travel so pupils stay inside the eye ovals.
  ───────────────────────────────────────────────────────────────────────── */
  const L_EYE = { x: 158, y: 218 };   // left  eye center
  const R_EYE = { x: 285, y: 224 };   // right eye center
  const L_MAX = { x: 18,  y: 25  };   // max left  pupil travel (px viewBox)
  const R_MAX = { x: 20,  y: 23  };   // max right pupil travel (px viewBox)
  const VB_W  = 460;                   // viewBox width
  const VB_H  = 460;                   // viewBox height

  /* ─────────────────────────────────────────────────────────────────────────
     STATE
  ───────────────────────────────────────────────────────────────────────── */
  // Reduced-motion preference
  const rmQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isRM      = rmQuery.matches;
  rmQuery.addEventListener('change', e => {
    isRM = e.matches;
    if (isRM) resetPupils();
  });

  // Pupil tracking state
  let targetL    = { x: 0, y: 0 };
  let targetR    = { x: 0, y: 0 };
  let currentL   = { x: 0, y: 0 };
  let currentR   = { x: 0, y: 0 };

  // Glance animation override (normalized direction { x, y } in [-1, 1])
  let glanceDir      = null;
  let sequenceDone   = false;   // true once glance sequence completes

  // Timer handles for cleanup
  let rafId        = null;
  let blinkTimer   = null;
  let thinkTimer   = null;
  let glanceTimer  = null;

  /* ═════════════════════════════════════════════════════════════════════════
     1 · DRAW-ON ANIMATION
     Animates the body outline via stroke-dashoffset, then calls afterDrawOn.
  ═════════════════════════════════════════════════════════════════════════ */
  function initDrawOn() {
    if (!bodyPath) {
      afterDrawOn();
      return;
    }

    if (isRM) {
      // Skip animation — reveal everything immediately
      bodyPath.classList.add('drawn');
      afterDrawOn();
      return;
    }

    // Measure path length and set up starting state
    const len = bodyPath.getTotalLength();
    bodyPath.style.strokeDasharray  = `${len}`;
    bodyPath.style.strokeDashoffset = `${len}`;
    bodyPath.style.transition       = 'none';

    // Two rAFs ensure the initial hidden state is painted before transition starts
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bodyPath.style.transition = 'stroke-dashoffset 0.9s cubic-bezier(0.37, 0, 0.63, 1)';
        bodyPath.style.strokeDashoffset = '0';
      });
    });

    // After stroke completes, trigger the rest of the entrance
    setTimeout(afterDrawOn, 980);
  }

  /* Called once the outline stroke is complete (or immediately in reduced-motion mode) */
  function afterDrawOn() {
    // Fade body fill in
    if (bodyPath) bodyPath.classList.add('drawn');

    // Mouth appears
    if (mouthEl) mouthEl.classList.add('visible');

    if (isRM) {
      // Reduced motion: show eyes instantly and mark ready
      showEyeInstant(leftEye);
      showEyeInstant(rightEye);
      sequenceDone = true;
    } else {
      // Eyes pop in with a brief stagger
      setTimeout(() => leftEye  && leftEye.classList.add('visible'),  90);
      setTimeout(() => rightEye && rightEye.classList.add('visible'), 190);

      // Start glance sequence after eyes have settled
      setTimeout(startGlanceSequence, 680);
    }

    // Start the pupil-tracking render loop regardless
    rafId = requestAnimationFrame(renderLoop);
  }

  function showEyeInstant(el) {
    if (!el) return;
    el.style.opacity   = '1';
    el.style.transform = 'scale(1)';
  }

  /* ═════════════════════════════════════════════════════════════════════════
     2 · GLANCE SEQUENCE
     Look left → right → down at the question → up thoughtfully → center
  ═════════════════════════════════════════════════════════════════════════ */
  function startGlanceSequence() {
    // Step 1: look left
    setGlance({ x: -1, y: 0.08 }, 480, () => {
      // Step 2: look right
      setGlance({ x: 1, y: 0.05 }, 520, () => {
        // Step 3: look down toward the question text
        setGlance({ x: 0.1, y: 0.85 }, 580, () => {
          // Step 4: look upward — Timmy is "thinking"
          setGlance({ x: -0.18, y: -1 }, 720, () => {
            glanceDir    = null;
            sequenceDone = true;
            // Brief pause then show thought bubble
            setTimeout(showThinkBubble, 220);
          });
        });
      });
    });
  }

  /**
   * Override pupil direction for `duration` ms, then call `cb`.
   * @param {{ x: number, y: number }} dir  Normalized direction [-1, 1]
   * @param {number}                   duration
   * @param {Function}                 cb
   */
  function setGlance(dir, duration, cb) {
    glanceDir = dir;
    clearTimeout(glanceTimer);
    glanceTimer = setTimeout(() => {
      glanceDir = null;
      if (cb) cb();
    }, duration);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     3 · THOUGHT BUBBLE
  ═════════════════════════════════════════════════════════════════════════ */
  function showThinkBubble() {
    if (!thinkBbl || isRM) return;
    thinkBbl.classList.add('visible');

    // Hide after 2.6 s, then schedule next appearance
    clearTimeout(thinkTimer);
    thinkTimer = setTimeout(() => {
      thinkBbl.classList.remove('visible');
      scheduleNextThink();
    }, 2600);
  }

  function hideThinkBubble() {
    if (!thinkBbl) return;
    thinkBbl.classList.remove('visible');
    clearTimeout(thinkTimer);
  }

  function scheduleNextThink() {
    if (isRM) return;
    // Reappear every 9–17 s
    thinkTimer = setTimeout(() => {
      setGlance({ x: -0.14, y: -1 }, 320, showThinkBubble);
    }, 9000 + Math.random() * 8000);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     4 · RENDER LOOP — smooth pupil tracking with linear interpolation
  ═════════════════════════════════════════════════════════════════════════ */
  function renderLoop() {
    if (!isRM) {
      // Determine interpolation targets
      const tL = glanceDir
        ? { x: glanceDir.x * L_MAX.x, y: glanceDir.y * L_MAX.y }
        : targetL;
      const tR = glanceDir
        ? { x: glanceDir.x * R_MAX.x, y: glanceDir.y * R_MAX.y }
        : targetR;

      const ease = 0.11;
      currentL.x += (tL.x - currentL.x) * ease;
      currentL.y += (tL.y - currentL.y) * ease;
      currentR.x += (tR.x - currentR.x) * ease;
      currentR.y += (tR.y - currentR.y) * ease;

      if (pupilL) {
        pupilL.setAttribute('transform',
          `translate(${currentL.x.toFixed(2)}, ${currentL.y.toFixed(2)})`);
      }
      if (pupilR) {
        pupilR.setAttribute('transform',
          `translate(${currentR.x.toFixed(2)}, ${currentR.y.toFixed(2)})`);
      }
    }

    rafId = requestAnimationFrame(renderLoop);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     5 · POINTER TRACKING MATH
  ═════════════════════════════════════════════════════════════════════════ */

  /**
   * Compute viewBox-space pupil offset toward a screen coordinate.
   * @param {{ x, y }} eyeCenter  Eye center in viewBox units
   * @param {{ x, y }} maxPx      Maximum travel in viewBox units
   * @param {number}   cx         Client X of target
   * @param {number}   cy         Client Y of target
   * @returns {{ x, y }}
   */
  function computeOffset(eyeCenter, maxPx, cx, cy) {
    if (!tSvg) return { x: 0, y: 0 };

    const rect   = tSvg.getBoundingClientRect();
    const scaleX = rect.width  / VB_W;
    const scaleY = rect.height / VB_H;

    // Eye position in screen pixels
    const esx = rect.left + eyeCenter.x * scaleX;
    const esy = rect.top  + eyeCenter.y * scaleY;

    const dx   = cx - esx;
    const dy   = cy - esy;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return { x: 0, y: 0 };

    const angle = Math.atan2(dy, dx);
    // Dampen: reaches max travel at ~270px screen distance
    const damp  = Math.min(1, dist / 270);

    return {
      x: Math.cos(angle) * maxPx.x * damp,
      y: Math.sin(angle) * maxPx.y * damp
    };
  }

  function trackPointer(cx, cy) {
    // Don't override glance animations; only track once sequence is done
    if (isRM || !sequenceDone || glanceDir) return;
    targetL = computeOffset(L_EYE, L_MAX, cx, cy);
    targetR = computeOffset(R_EYE, R_MAX, cx, cy);
  }

  function resetPupils() {
    targetL = targetR = { x: 0, y: 0 };
  }

  // Pointer events
  window.addEventListener('pointermove', e => trackPointer(e.clientX, e.clientY), { passive: true });

  window.addEventListener('touchmove', e => {
    if (e.touches && e.touches[0]) {
      trackPointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  // Return eyes to center when cursor leaves the page
  document.addEventListener('mouseleave', () => {
    if (!glanceDir) resetPupils();
  });

  window.addEventListener('touchend', () => {
    if (!glanceDir) resetPupils();
  });

  /* ═════════════════════════════════════════════════════════════════════════
     6 · MOOD HOVER LOOK
     Timmy's pupils glance toward whichever mood pill the user hovers.
  ═════════════════════════════════════════════════════════════════════════ */
  moodPills.forEach(pill => {
    pill.addEventListener('mouseenter', () => {
      if (!sequenceDone || isRM || glanceDir) return;
      const r  = pill.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      targetL = computeOffset(L_EYE, L_MAX, cx, cy);
      targetR = computeOffset(R_EYE, R_MAX, cx, cy);
    });

    // mouseleave: next pointermove will update targets naturally
  });

  /* ═════════════════════════════════════════════════════════════════════════
     7 · MOOD SELECTION
  ═════════════════════════════════════════════════════════════════════════ */
  moodPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const key  = pill.dataset.mood;
      const data = MOOD_DATA[key];
      if (!data) return;

      // ── Update selected states ──────────────────────────────────────────
      moodPills.forEach(p => {
        const sel = p === pill;
        p.classList.toggle('selected', sel);
        p.setAttribute('aria-pressed', sel ? 'true' : 'false');
      });

      // ── Timmy reaction: look up → think → settle ────────────────────────
      if (!isRM) {
        hideThinkBubble();
        // Look up thoughtfully
        setGlance({ x: -0.2, y: -1 }, 420, () => {
          // Flash the thought bubble briefly
          showThinkBubble();
          // After ~1.1s of "thinking", dismiss and go back to normal
          setTimeout(() => {
            hideThinkBubble();
            glanceDir = null;
            scheduleNextThink();
          }, 1100);
        });
      }

      // ── Update mouth expression ─────────────────────────────────────────
      if (mouthEl && data.mouth) {
        mouthEl.setAttribute('d', data.mouth);
      }

      // ── Show empathetic response ────────────────────────────────────────
      if (responseEl) {
        responseEl.textContent = data.response;
        responseEl.classList.remove('visible');
        void responseEl.offsetWidth;   // force reflow to restart transition
        responseEl.classList.add('visible');
      }

      // ── Enable Continue button ──────────────────────────────────────────
      if (continueEl) continueEl.classList.add('active');

      // ── Persist mood ────────────────────────────────────────────────────
      try {
        sessionStorage.setItem('alvi_user_mood', key);
        sessionStorage.setItem('alvi_mood_timestamp', new Date().toISOString());
      } catch (_) { /* storage unavailable, ignore */ }
    });
  });

  /* ═════════════════════════════════════════════════════════════════════════
     8 · BLINKING
  ═════════════════════════════════════════════════════════════════════════ */
  function scheduleBlink() {
    if (isRM) return;
    // Random interval: 4.2s – 7.8s
    blinkTimer = setTimeout(() => {
      if (scene) {
        scene.classList.add('blinking');
        setTimeout(() => {
          scene && scene.classList.remove('blinking');
          scheduleBlink();
        }, 118);
      } else {
        scheduleBlink();
      }
    }, 4200 + Math.random() * 3600);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     BOOT
  ═════════════════════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    initDrawOn();
    // Start blinking after the full entrance sequence has settled
    setTimeout(scheduleBlink, 2400);
  });

  /* ═════════════════════════════════════════════════════════════════════════
     CLEANUP on page unload
  ═════════════════════════════════════════════════════════════════════════ */
  window.addEventListener('beforeunload', () => {
    if (rafId)       cancelAnimationFrame(rafId);
    if (blinkTimer)  clearTimeout(blinkTimer);
    if (thinkTimer)  clearTimeout(thinkTimer);
    if (glanceTimer) clearTimeout(glanceTimer);
  });

})();
