// ALVI — Common App Script

window.ALVI = window.ALVI || {};

// Shared timeline baseline dataset
window.ALVI.timelineData = {
  'jan': {
    month: 'JANUARY CHECK-IN',
    summary: 'Voice: Stable (94%) · Story Recall: 5 / 5 elements · MindPlay: 94%',
    status: 'Status: Baseline Stable',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  'mar': {
    month: 'MARCH CHECK-IN',
    summary: 'Voice: Stable (92%) · Story Recall: 5 / 5 elements · MindPlay: 92%',
    status: 'Status: Stable Baseline',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  'may': {
    month: 'MAY CHECK-IN',
    summary: 'Voice: Stable (91%) · Story Recall: 5 / 6 elements · MindPlay: 92%',
    status: 'Status: Stable Baseline',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  'july': {
    month: 'JULY CHECK-IN',
    summary: 'Voice: Minor Hesitation · Story Recall: 4 / 5 elements · MindPlay: 86%',
    status: 'Status: Monitor Signal',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  'today': {
    month: "TODAY'S CHECK-IN SNAPSHOT",
    summary: 'Voice: Slight Variation (+14% pauses) · Story Recall: 4 / 5 elements · MindPlay: 84%',
    status: 'Status: Monitor Variation',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  'voice': {
    month: 'VOICE HISTORY WAVEFORM',
    summary: 'Longitudinal acoustic baseline mapped across 5 check-ins from January to Today.',
    status: 'Audio Pipeline Active',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
  }
};

// Interactive Timeline Node Click Handler for Dashboard
document.addEventListener('DOMContentLoaded', () => {
  const timelineNodes = document.querySelectorAll('[data-timeline-info]');
  const detailBox = document.getElementById('timeline-detail-box');

  if (timelineNodes.length > 0 && detailBox) {
    timelineNodes.forEach(node => {
      node.addEventListener('click', () => {
        const key = node.getAttribute('data-timeline-info');
        const info = window.ALVI?.timelineData?.[key];
        if (info) {
          // Highlight selected node
          timelineNodes.forEach(n => {
            n.classList.remove('ring-2', 'ring-indigo-400', 'ring-offset-2', 'ring-offset-slate-900', 'rounded-2xl', 'scale-105');
          });
          node.classList.add('ring-2', 'ring-indigo-400', 'ring-offset-2', 'ring-offset-slate-900', 'rounded-2xl', 'scale-105');

          // Smooth transition effect for detail card update
          detailBox.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
          detailBox.style.opacity = '0.4';
          detailBox.style.transform = 'translateY(3px)';

          setTimeout(() => {
            const titleEl = detailBox.querySelector('h4');
            const summaryEl = detailBox.querySelector('p');
            if (titleEl) titleEl.textContent = info.month;
            if (summaryEl) summaryEl.textContent = info.summary;

            detailBox.style.opacity = '1';
            detailBox.style.transform = 'translateY(0)';
          }, 120);
        }
      });
    });
  }

  // App-wide Profile Synchronization from localStorage
  window.ALVI.syncProfile = function() {
    const DEFAULT_NAME = 'Mr. Sharma';
    const DEFAULT_ID = '#ALVI-889B-IND';

    const savedName = localStorage.getItem('alvi_user_name') || DEFAULT_NAME;
    const savedId = localStorage.getItem('alvi_user_id') || DEFAULT_ID;

    function getInitials(name) {
      if (!name || typeof name !== 'string') return 'MS';
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
      }
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    const initials = getInitials(savedName);

    // Sidebar Profile Elements
    const sidebarAvatarEls = document.querySelectorAll('#sidebar-avatar-initials');
    sidebarAvatarEls.forEach(el => el.textContent = initials);

    const sidebarNameEls = document.querySelectorAll('#sidebar-profile-name');
    sidebarNameEls.forEach(el => el.textContent = savedName);

    const sidebarIdEls = document.querySelectorAll('#sidebar-profile-id');
    sidebarIdEls.forEach(el => el.textContent = `ID: ${savedId}`);

    // Welcome Greetings across pages (e.g. Dashboard)
    const welcomeHeadings = document.querySelectorAll('#dashboard-welcome-heading');
    welcomeHeadings.forEach(el => {
      el.textContent = `Good morning, ${savedName} 👋`;
    });

    // Profile Page Elements
    const profileNameEl = document.getElementById('profile-name');
    if (profileNameEl) profileNameEl.textContent = savedName;

    const profileIdEl = document.getElementById('profile-id');
    if (profileIdEl) profileIdEl.textContent = savedId;

    const profileAvatarEl = document.getElementById('profile-avatar-initials');
    if (profileAvatarEl) profileAvatarEl.textContent = initials;
  };

  // Synchronize profile on load
  window.ALVI.syncProfile();
});



