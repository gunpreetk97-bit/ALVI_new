/**
 * ALVI — Interactive Brain Prototype Logic
 * Smooth 3D perspective tilt (cursor & touch), anatomical contour interaction,
 * keyboard accessibility, and scientific region disclosure.
 */

(function () {
  'use strict';

  // ── 1. Regional Knowledge Base (Functional & Cognitive Associations) ────────
  const BRAIN_REGIONS = {
    frontal: {
      name: "Frontal Lobe",
      code: "EXECUTIVE / SPEECH MOTOR",
      desc: "Coordinates executive planning, working memory, and expressive motor speech (Broca's area). In ALVI assessments, pause distribution and lexical search latencies correlate with frontal initiation dynamics.",
      center: { x: 230, y: 310 }
    },
    temporal: {
      name: "Temporal Lobe",
      code: "LANGUAGE COMPREHENSION / MEMORY",
      desc: "Houses Wernicke's area and the medial hippocampal complex. Directly supports narrative retrieval in the Story Recall task, semantic fluency, and auditory processing of natural speech.",
      center: { x: 440, y: 400 }
    },
    parietal: {
      name: "Parietal Lobe",
      code: "SPATIAL REASONING / INTEGRATION",
      desc: "Integrates somatosensory inputs, spatial orientation, and numerical sequencing. Evaluated during MindPlay's multi-step event sequence reordering and mental workspace operations.",
      center: { x: 490, y: 220 }
    },
    occipital: {
      name: "Occipital Lobe",
      code: "VISUAL DECODING / SCENE ANALYSIS",
      desc: "Primary and secondary visual cortex. Engaged during the Park Scene description task to decode spatial relationships, character entities, and contextual narrative anchors.",
      center: { x: 640, y: 410 }
    },
    cerebellum: {
      name: "Cerebellum & Brainstem",
      code: "MOTOR COORDINATION / AUTONOMIC TIMING",
      desc: "Regulates fine-motor articulation, syllable rhythm, speech timing stability, and fundamental frequency consistency (F0) captured during continuous acoustic recording.",
      center: { x: 530, y: 550 }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const viewport = document.getElementById('brain-viewport');
    const tiltLayer = document.getElementById('brain-tilt-layer');
    const lobeRegions = document.querySelectorAll('.lobe-region');
    const lobeButtons = document.querySelectorAll('.lobe-btn');
    const regionName = document.getElementById('region-name');
    const regionCode = document.getElementById('region-code');
    const regionDesc = document.getElementById('region-desc');
    const resetTiltBtn = document.getElementById('reset-tilt-btn');

    // Accessibility: Reduced Motion detection
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isReducedMotion = reducedMotionQuery.matches;
    reducedMotionQuery.addEventListener('change', (e) => {
      isReducedMotion = e.matches;
      if (isReducedMotion && tiltLayer) {
        tiltLayer.style.transform = 'none';
      }
    });

    let currentActiveRegion = 'frontal';

    // ── 2. Region Activation & Selection ──────────────────────────────────────
    function activateRegion(regionKey, focusSource = 'click') {
      const info = BRAIN_REGIONS[regionKey];
      if (!info) return;

      currentActiveRegion = regionKey;

      // 1. Update SVG Region Styles
      lobeRegions.forEach((region) => {
        const isMatch = region.getAttribute('data-region') === regionKey;
        region.classList.toggle('active-lobe', isMatch);
        region.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
      });

      // 2. Update Button Strip Styles
      lobeButtons.forEach((btn) => {
        const isMatch = btn.getAttribute('data-target') === regionKey;
        btn.classList.toggle('selected', isMatch);
        btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      });

      // 3. Update Detail Card Information with subtle fade transition
      if (regionName && regionCode && regionDesc) {
        const card = document.getElementById('region-card');
        if (card) {
          card.style.opacity = '0.4';
          card.style.transform = 'translateY(2px)';
        }

        setTimeout(() => {
          regionName.textContent = info.name;
          regionCode.textContent = info.code;
          regionDesc.textContent = info.desc;
          if (card) {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }
        }, 90);
      }
    }

    // Attach click and keyboard handlers to SVG Lobes
    lobeRegions.forEach((region) => {
      const key = region.getAttribute('data-region');
      
      region.addEventListener('click', () => {
        activateRegion(key, 'svg');
      });

      region.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activateRegion(key, 'keyboard');
        }
      });
    });

    // Attach click handlers to accessible button strip
    lobeButtons.forEach((btn) => {
      const key = btn.getAttribute('data-target');
      btn.addEventListener('click', () => {
        activateRegion(key, 'pill');
      });
    });

    // Set initial region
    activateRegion('frontal');

    // ── 3. Smooth Perspective 3D Tilt (Cursor & Touch Responsive) ─────────────
    let tiltX = 0;
    let tiltY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let isHovering = false;
    let rafId = null;

    function handlePointerMove(clientX, clientY) {
      if (isReducedMotion || !viewport || !tiltLayer) return;

      const rect = viewport.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalized coordinates (-1 to +1)
      const normX = (clientX - centerX) / (rect.width / 2);
      const normY = (clientY - centerY) / (rect.height / 2);

      // Clamp within gentle range: ±9 degrees rotateY, ±6 degrees rotateX
      const clampedX = Math.max(-1.5, Math.min(1.5, normX));
      const clampedY = Math.max(-1.5, Math.min(1.5, normY));

      targetTiltX = clampedY * -6; // cursor down tilts back up
      targetTiltY = clampedX * 9;  // cursor right tilts right
      isHovering = true;
    }

    // Render loop for buttery-smooth lerp interpolation
    function renderTilt() {
      if (!isReducedMotion && tiltLayer) {
        const ease = 0.12;
        tiltX += (targetTiltX - tiltX) * ease;
        tiltY += (targetTiltY - tiltY) * ease;

        if (Math.abs(targetTiltX - tiltX) > 0.01 || Math.abs(targetTiltY - tiltY) > 0.01) {
          tiltLayer.style.transform = `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(12px)`;
        } else if (!isHovering) {
          tiltLayer.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
        }
      }
      rafId = requestAnimationFrame(renderTilt);
    }

    rafId = requestAnimationFrame(renderTilt);

    // Viewport mouse tracking
    window.addEventListener('pointermove', (e) => {
      handlePointerMove(e.clientX, e.clientY);
    }, { passive: true });

    // Touch support for tablets & mobile
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Smooth return-to-rest animation on leave
    function returnToRest() {
      targetTiltX = 0;
      targetTiltY = 0;
      isHovering = false;
    }

    document.addEventListener('mouseleave', returnToRest);
    window.addEventListener('touchend', returnToRest);

    if (resetTiltBtn) {
      resetTiltBtn.addEventListener('click', () => {
        returnToRest();
        if (tiltLayer) {
          tiltLayer.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
        }
      });
    }

    // Clean up
    window.addEventListener('beforeunload', () => {
      if (rafId) cancelAnimationFrame(rafId);
    });
  });
})();

