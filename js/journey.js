// Cognitive Journey Trend Graph Script

document.addEventListener('DOMContentLoaded', () => {
  let journeyChartInstance = null;

  function renderCognitiveJourneyChart(category = 'overall') {
    const ctxChart = document.getElementById('cognitive-journey-chart');
    if (!ctxChart) return;

    if (journeyChartInstance) {
      journeyChartInstance.destroy();
    }

    const labels = ['January', 'March', 'May', 'July', 'Today'];

    const datasetsConfig = {
      'overall': {
        personal: [94, 92, 91, 86, 84],
        upperBand: [96, 95, 95, 94, 94],
        lowerBand: [90, 90, 89, 88, 88],
        label: 'Overall Cognitive Score (%)'
      },
      'voice': {
        personal: [96, 94, 93, 85, 82],
        upperBand: [98, 97, 96, 96, 95],
        lowerBand: [91, 90, 89, 88, 88],
        label: 'Voice Fluency Score (%)'
      },
      'story': {
        personal: [100, 100, 95, 80, 80],
        upperBand: [100, 100, 100, 100, 100],
        lowerBand: [85, 85, 85, 85, 85],
        label: 'Story Anchor Recall (%)'
      },
      'mindplay': {
        personal: [94, 92, 92, 88, 84],
        upperBand: [96, 96, 95, 95, 95],
        lowerBand: [90, 90, 89, 88, 88],
        label: 'MindPlay Accuracy (%)'
      }
    };

    const cfg = datasetsConfig[category] || datasetsConfig['overall'];

    journeyChartInstance = new Chart(ctxChart, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: cfg.label,
            data: cfg.personal,
            borderColor: '#4F46E5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            borderWidth: 3.5,
            pointBackgroundColor: ['#22C55E', '#22C55E', '#22C55E', '#F59E0B', '#F59E0B'],
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 3,
            pointRadius: 7,
            pointHoverRadius: 10,
            tension: 0.35,
            fill: false
          },
          {
            label: 'Normal Baseline Band (Upper)',
            data: cfg.upperBand,
            borderColor: 'rgba(99, 102, 241, 0.2)',
            borderWidth: 1,
            borderDash: [5, 5],
            pointRadius: 0,
            tension: 0.35,
            fill: false
          },
          {
            label: 'Normal Baseline Band (Lower)',
            data: cfg.lowerBand,
            borderColor: 'rgba(99, 102, 241, 0.2)',
            borderWidth: 1,
            borderDash: [5, 5],
            backgroundColor: 'rgba(79, 70, 229, 0.05)',
            pointRadius: 0,
            tension: 0.35,
            fill: '-1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const monthKeys = ['jan', 'mar', 'may', 'july', 'today'];
            const key = monthKeys[index];
            const info = window.ALVI?.timelineData?.[key];
            if (info) {
              const pointMonthTitle = document.getElementById('point-month-title');
              const pointMetricsSummary = document.getElementById('point-metrics-summary');
              const pointStatusBadge = document.getElementById('point-status-badge');

              if (pointMonthTitle) pointMonthTitle.textContent = info.month;
              if (pointMetricsSummary) pointMetricsSummary.textContent = info.summary;
              if (pointStatusBadge) {
                pointStatusBadge.textContent = info.status;
                pointStatusBadge.className = `px-3 py-1 rounded-full text-xs font-bold ${info.badgeClass} border`;
              }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 12,
            cornerRadius: 12
          }
        },
        scales: {
          y: {
            min: 70,
            max: 100,
            grid: { color: '#F1F5F9' },
            ticks: {
              callback: (val) => `${val}%`,
              font: { size: 11, weight: '600' },
              color: '#64748B'
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 12, weight: '700' },
              color: '#1E293B'
            }
          }
        }
      }
    });
  }

  // Category Tab button handlers
  const tabBtns = document.querySelectorAll('#journey-tabs .tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-tab');
      renderCognitiveJourneyChart(tab);
    });
  });

  const openPatternsBtn = document.querySelector('[data-page="pattern-explorer"]');
  if (openPatternsBtn) {
    openPatternsBtn.addEventListener('click', () => {
      window.location.href = 'patterns.html';
    });
  }

  // Initial render
  renderCognitiveJourneyChart('overall');
});
