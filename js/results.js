// ─────────────────────────────────────────────────────────────────────────────
// ALVI Results Page — js/results.js
//
// Reads real session data via ALVI.session.get() and populates the
// Today's Snapshot page with actual measurements.
//
// No hardcoded clinical metrics. No AI predictions. No fake baselines.
// Shows "Not recorded" or "Awaiting AI analysis" when data is unavailable.
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // ── Navigation buttons ──────────────────────────────────────────────────────
  const whySeeingBtn = document.querySelector('[data-page="ai-insights"]');
  if (whySeeingBtn) {
    whySeeingBtn.addEventListener('click', () => {
      window.location.href = 'insights.html';
    });
  }

  const viewJourneyBtn = document.querySelector('[data-page="cognitive-journey"]');
  if (viewJourneyBtn) {
    viewJourneyBtn.addEventListener('click', () => {
      window.location.href = 'journey.html';
    });
  }

  // ── Date display ────────────────────────────────────────────────────────────
  const dateEl = document.getElementById('results-date');
  if (dateEl) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    dateEl.textContent = dateStr + ', ' + timeStr;
  }

  // ── Session data ────────────────────────────────────────────────────────────
  if (!window.ALVI || !ALVI.session) {
    console.warn('ALVI.session not available — results.js cannot populate session data.');
    return;
  }

  const session = ALVI.session.get();

  // ── Helper: format seconds as "Xs" or "Xm Ys" ──────────────────────────────
  function formatDuration(seconds) {
    if (!seconds || seconds <= 0) return 'N/A';
    const s = Math.round(seconds);
    if (s < 60) return s + 's';
    return Math.floor(s / 60) + 'm ' + (s % 60) + 's';
  }

  // ── Helper: format milliseconds as "X.Xs" ──────────────────────────────────
  function formatMs(ms) {
    if (ms == null || ms <= 0) return 'N/A';
    return (ms / 1000).toFixed(1) + 's';
  }

  // ── VOICE CARD ──────────────────────────────────────────────────────────────
  const voiceStatus   = document.getElementById('voice-status');
  const voiceDetail   = document.getElementById('voice-detail');
  const voiceDuration = document.getElementById('voice-duration');

  if (session.voice.completed) {
    if (voiceStatus)   voiceStatus.textContent   = 'Completed';
    if (voiceDetail)   voiceDetail.textContent   = 'Awaiting AI analysis';
    if (voiceDuration) voiceDuration.textContent = formatDuration(session.voice.durationSeconds);
  } else {
    if (voiceStatus)   voiceStatus.textContent   = 'Not recorded';
    if (voiceDetail)   voiceDetail.textContent   = 'Voice description was skipped this session.';
    if (voiceDuration) voiceDuration.textContent = '—';
  }

  // ── STORY RECALL CARD ───────────────────────────────────────────────────────
  const storyStatus   = document.getElementById('story-status');
  const storyDetail   = document.getElementById('story-detail');
  const storyDuration = document.getElementById('story-duration');

  if (session.story.completed) {
    if (storyStatus)   storyStatus.textContent   = 'Completed';
    if (storyDetail)   storyDetail.textContent   = 'Awaiting AI analysis';
    if (storyDuration) storyDuration.textContent = formatDuration(session.story.durationSeconds);
  } else {
    if (storyStatus)   storyStatus.textContent   = 'Not recorded';
    if (storyDetail)   storyDetail.textContent   = 'Story recall was skipped this session.';
    if (storyDuration) storyDuration.textContent = '—';
  }

  // ── MINDPLAY CARD ───────────────────────────────────────────────────────────
  const mpScore    = document.getElementById('mindplay-score');
  const mpDetail   = document.getElementById('mindplay-detail');
  const mpRemember = document.getElementById('mindplay-remember');
  const mpSequence = document.getElementById('mindplay-sequence');
  const mpFind     = document.getElementById('mindplay-find');
  const mpReaction = document.getElementById('mindplay-reaction');

  if (session.mindplay.completed) {
    // Overall score: 1 point per correct challenge
    const correctCount = [
      session.mindplay.ch1_correct,
      session.mindplay.ch2_correct,
      session.mindplay.ch3_correct
    ].filter(Boolean).length;

    if (mpScore)    mpScore.textContent    = correctCount + ' / 3 Challenges Correct';
    if (mpDetail)   mpDetail.textContent   = 'MindPlay completed this session.';
    if (mpRemember) mpRemember.textContent = (session.mindplay.ch1_score ?? 0) + ' / 2';
    if (mpSequence) mpSequence.textContent = session.mindplay.ch2_correct ? 'Correct' : 'Incorrect';
    if (mpFind)     mpFind.textContent     = session.mindplay.ch3_correct ? 'Correct' : 'Incorrect';
    if (mpReaction) mpReaction.textContent = formatMs(session.mindplay.ch3_reactionMs);
  } else {
    if (mpScore)    mpScore.textContent    = 'Not completed';
    if (mpDetail)   mpDetail.textContent   = 'MindPlay was skipped this session.';
    if (mpRemember) mpRemember.textContent = '—';
    if (mpSequence) mpSequence.textContent = '—';
    if (mpFind)     mpFind.textContent     = '—';
    if (mpReaction) mpReaction.textContent = '—';
  }

  // ── BANNER ─────────────────────────────────────────────────────────────────
  const bannerHeadline = document.getElementById('banner-headline');
  const bannerSubtext  = document.getElementById('banner-subtext');
  const bannerEl       = document.getElementById('results-banner');

  const anyCompleted = session.voice.completed || session.story.completed || session.mindplay.completed;

  if (session.mindplay.completed) {
    const correctCount = [
      session.mindplay.ch1_correct,
      session.mindplay.ch2_correct,
      session.mindplay.ch3_correct
    ].filter(Boolean).length;

    if (bannerHeadline) bannerHeadline.textContent = 'MindPlay Score: ' + correctCount + ' / 3';
    if (bannerSubtext) {
      bannerSubtext.textContent =
        'Voice: ' + (session.voice.completed ? 'Completed' : 'Skipped') +
        '  •  Story Recall: ' + (session.story.completed ? 'Completed' : 'Skipped') +
        '  •  MindPlay: ' + correctCount + '/3 challenges correct.';
    }
  } else if (anyCompleted) {
    if (bannerHeadline) bannerHeadline.textContent = 'Partial Check-in';
    if (bannerSubtext) {
      bannerSubtext.textContent = 'Some activities were completed. Complete all three for a full session summary.';
    }
  } else {
    if (bannerHeadline) bannerHeadline.textContent = 'No Check-in Data';
    if (bannerSubtext) {
      bannerSubtext.textContent = 'No session data found. Please complete a check-in to see your results here.';
    }
    // Dim the banner if nothing was done
    if (bannerEl) {
      bannerEl.classList.remove('from-indigo-600', 'via-indigo-700', 'to-purple-700');
      bannerEl.classList.add('from-slate-600', 'via-slate-700', 'to-slate-800');
    }
  }

});
