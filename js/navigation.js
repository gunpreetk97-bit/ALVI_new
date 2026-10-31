// ALVI Navigation & Sidebar Active State Handler

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname.toLowerCase();

  const pageMap = {
    'dashboard': 'dashboard.html',
    'today-checkin': 'voice.html',
    'voice-description': 'voice.html',
    'voice': 'voice.html',
    'story-recall': 'story.html',
    'story': 'story.html',
    'mindplay': 'mindplay.html',
    'ai-analysis': 'analysis.html',
    'analysis': 'analysis.html',
    'results': 'results.html',
    'cognitive-journey': 'journey.html',
    'journey': 'journey.html',
    'pattern-explorer': 'patterns.html',
    'patterns': 'patterns.html',
    'ai-insights': 'insights.html',
    'insights': 'insights.html',
    'profile': 'profile.html'
  };

  // Highlight active nav item based on current page URL
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const pageId = item.getAttribute('data-page');
    const targetFile = pageMap[pageId];

    if (targetFile && (currentPath.endsWith(targetFile) || (currentPath.endsWith('/') && targetFile === 'dashboard.html') || (currentPath.endsWith('index.html') && targetFile === 'dashboard.html'))) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }

    item.addEventListener('click', () => {
      if (targetFile) {
        window.location.href = targetFile;
      }
    });
  });

  // Global navigation button handlers
  document.querySelectorAll('[data-page]').forEach(btn => {
    if (!btn.classList.contains('nav-item')) {
      btn.addEventListener('click', () => {
        const pageId = btn.getAttribute('data-page');
        const targetFile = pageMap[pageId];
        if (targetFile) {
          window.location.href = targetFile;
        }
      });
    }
  });

  // Action button specific routing
  const quickCheckinBtn = document.getElementById('quick-checkin-btn');
  if (quickCheckinBtn) {
    quickCheckinBtn.addEventListener('click', () => {
      window.location.href = 'voice.html';
    });
  }

  const startCheckinMainBtn = document.getElementById('start-checkin-main-btn');
  if (startCheckinMainBtn) {
    startCheckinMainBtn.addEventListener('click', () => {
      window.location.href = 'voice.html';
    });
  }

  const profileCardBtn = document.getElementById('profile-card-btn');
  if (profileCardBtn) {
    profileCardBtn.addEventListener('click', () => {
      window.location.href = 'profile.html';
    });
  }
});
