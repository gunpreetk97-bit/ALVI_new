// ─────────────────────────────────────────────────────────────────────────────
// ALVI Session Manager — js/session.js
//
// Manages a single check-in session stored in sessionStorage under the key
// 'alvi_session'. sessionStorage is tab-scoped and is automatically cleared
// when the browser tab is closed — no persistent audio or sensitive data
// accumulates over time.
//
// The raw audio Blob and MediaRecorder objects are NEVER written here.
// Only factual, observable metadata about each activity is stored.
//
// ── Data Shape ───────────────────────────────────────────────────────────────
//
// {
//   sessionId  : string   — unique ID for this check-in (timestamp-based)
//   startedAt  : string   — ISO timestamp of when the session began
//
//   voice: {
//     completed      : boolean  — true if Stop Recording was reached
//     durationSeconds: number   — how many seconds were actually recorded (0 if skipped)
//   },
//
//   story: {
//     completed      : boolean
//     durationSeconds: number
//   },
//
//   mindplay: {
//     ch1_selected   : string[] — item keys the user selected (e.g. ["umbrella","apples"])
//     ch1_correct    : boolean  — did they select exactly the two correct items?
//     ch1_score      : number   — count of correct selections (0–2)
//     ch2_correct    : boolean  — was the final sequence in the right order?
//     ch3_correct    : boolean  — did they tap the right Find card?
//     ch3_reactionMs : number   — ms elapsed on the Find timer when tapped
//     completed      : boolean  — true when Complete MindPlay was reached
//   }
// }
//
// ── Usage by each page ───────────────────────────────────────────────────────
//
//  voice.js   → ALVI.session.init()            on page load (resets any old session)
//             → ALVI.session.saveVoice({...})  after Stop Recording
//
//  story.js   → ALVI.session.saveStory({...})  after Stop Retell
//
//  mindplay.js→ ALVI.session.saveMindplay({…}) when Complete MindPlay is clicked
//
//  results.js → ALVI.session.get()             to read and render the summary
//
// ─────────────────────────────────────────────────────────────────────────────

window.ALVI = window.ALVI || {};

(function () {

  // ── Private constants ───────────────────────────────────────────────────────
  const STORAGE_KEY = 'alvi_session';

  // Default blank template — ensures every key always exists even if an
  // activity was skipped, so results.js can safely read any field.
  function blankSession() {
    return {
      sessionId:  generateId(),
      startedAt:  new Date().toISOString(),

      voice: {
        completed:       false,
        durationSeconds: 0
      },

      story: {
        completed:       false,
        durationSeconds: 0
      },

      mindplay: {
        ch1_selected:    [],
        ch1_correct:     false,
        ch1_score:       0,
        ch2_correct:     false,
        ch3_correct:     false,
        ch3_reactionMs:  null,
        completed:       false
      }
    };
  }

  // Simple timestamp-based ID — no external libraries needed.
  function generateId() {
    return 'alvi-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  }

  // ── Private read / write helpers ────────────────────────────────────────────
  function readRaw() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function writeRaw(obj) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (_) {
      // sessionStorage full or unavailable — fail silently so recording still works
    }
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * init()
   *
   * Call this at the START of a new check-in (i.e. when voice.html loads).
   * Wipes any previous session and writes a fresh blank one.
   * Preserves localStorage keys (alvi_user_name, alvi_user_id) — those are
   * never touched here.
   *
   * Example:
   *   ALVI.session.init();
   */
  function init() {
    writeRaw(blankSession());
  }

  /**
   * get()
   *
   * Returns the current session object, or a blank session if nothing is stored.
   * Safe to call even if init() was never called (e.g. user navigates directly
   * to results.html) — returns a blank object so results.js can fall back to
   * its hardcoded defaults.
   *
   * Example:
   *   const session = ALVI.session.get();
   *   console.log(session.voice.durationSeconds);
   */
  function get() {
    return readRaw() || blankSession();
  }

  /**
   * _merge(patch)
   *
   * Internal deep-merge helper. Reads the current session, applies a patch
   * object one level deep (activity namespace), and writes it back.
   * This ensures that saving voice data never accidentally wipes story data
   * that was already saved.
   *
   * @param {Object} patch — e.g. { voice: { completed: true, durationSeconds: 28 } }
   */
  function _merge(patch) {
    const current = readRaw() || blankSession();
    for (const key of Object.keys(patch)) {
      if (typeof patch[key] === 'object' && patch[key] !== null && !Array.isArray(patch[key])) {
        // Deep-merge one level (activity namespace)
        current[key] = Object.assign({}, current[key] || {}, patch[key]);
      } else {
        current[key] = patch[key];
      }
    }
    writeRaw(current);
  }

  /**
   * saveVoice({ completed, durationSeconds })
   *
   * Call this when Voice Description recording finishes (Stop or auto-stop).
   * Does not affect story or mindplay data already in the session.
   *
   * @param {boolean} completed       — was Stop Recording reached?
   * @param {number}  durationSeconds — seconds actually recorded
   *
   * Example (on stopRecording in voice.js):
   *   ALVI.session.saveVoice({ completed: true, durationSeconds: voiceElapsedSeconds });
   *
   * Example (on "Continue" without recording):
   *   ALVI.session.saveVoice({ completed: false, durationSeconds: 0 });
   */
  function saveVoice({ completed = false, durationSeconds = 0 } = {}) {
    _merge({ voice: { completed, durationSeconds } });
  }

  /**
   * saveStory({ completed, durationSeconds })
   *
   * Call this when Story Recall recording finishes.
   * Does not affect voice or mindplay data.
   *
   * Example (on stopStoryRecording in story.js):
   *   ALVI.session.saveStory({ completed: true, durationSeconds: storyElapsed });
   */
  function saveStory({ completed = false, durationSeconds = 0 } = {}) {
    _merge({ story: { completed, durationSeconds } });
  }

  /**
   * saveMindplay({ ch1_selected, ch1_correct, ch1_score,
   *                ch2_correct, ch3_correct, ch3_reactionMs, completed })
   *
   * Call this when the user reaches the MindPlay summary (Complete MindPlay).
   * All scoring logic stays in mindplay.js — only the already-computed results
   * are passed here for storage.
   *
   * @param {string[]} ch1_selected   — e.g. ["umbrella", "apples"]
   * @param {boolean}  ch1_correct    — true if selected exactly the correct items
   * @param {number}   ch1_score      — number of correct items selected (0, 1, or 2)
   * @param {boolean}  ch2_correct    — true if sequence is in correct order
   * @param {boolean}  ch3_correct    — true if user tapped the umbrella card
   * @param {number|null} ch3_reactionMs — milliseconds to tap (null if never tapped)
   * @param {boolean}  completed      — true when Complete MindPlay button was pressed
   *
   * Example:
   *   ALVI.session.saveMindplay({
   *     ch1_selected:   [...selectedCh1Items],
   *     ch1_correct:    ch1Score === 2,
   *     ch1_score:      ch1Score,
   *     ch2_correct:    sequenceIsCorrect,
   *     ch3_correct:    findIsCorrect,
   *     ch3_reactionMs: findMilliseconds,
   *     completed:      true
   *   });
   */
  function saveMindplay({
    ch1_selected   = [],
    ch1_correct    = false,
    ch1_score      = 0,
    ch2_correct    = false,
    ch3_correct    = false,
    ch3_reactionMs = null,
    completed      = false
  } = {}) {
    _merge({
      mindplay: {
        ch1_selected,
        ch1_correct,
        ch1_score,
        ch2_correct,
        ch3_correct,
        ch3_reactionMs,
        completed
      }
    });
  }

  /**
   * reset()
   *
   * Alias for init(). Use this on "New Check-in" button to discard the
   * previous session and start fresh.
   *
   * Example (on New Check-in button click):
   *   ALVI.session.reset();
   *   window.location.href = 'voice.html';
   */
  function reset() {
    init();
  }

  // ── Expose on window.ALVI.session ──────────────────────────────────────────
  window.ALVI.session = {
    init,
    get,
    saveVoice,
    saveStory,
    saveMindplay,
    reset
  };

})();
