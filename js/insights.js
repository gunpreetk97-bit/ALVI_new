// AI Insights Page Script

document.addEventListener('DOMContentLoaded', () => {
  const insightCards = document.querySelectorAll('#page-ai-insights .grid > div');

  insightCards.forEach(card => {
    card.classList.add('cursor-pointer', 'transition-all', 'duration-200');

    card.addEventListener('click', () => {
      insightCards.forEach(c => {
        c.classList.remove('ring-2', 'ring-indigo-500', 'border-indigo-300', 'bg-indigo-50/20');
      });
      card.classList.add('ring-2', 'ring-indigo-500', 'border-indigo-300', 'bg-indigo-50/20');
    });
  });
});

