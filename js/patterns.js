// Pattern Explorer Comparative Chart Script

document.addEventListener('DOMContentLoaded', () => {
  let patternExplorerInstance = null;

  function renderPatternExplorerChart(filter = 'overall') {
    const ctxExp = document.getElementById('pattern-explorer-chart');
    if (!ctxExp) return;

    if (patternExplorerInstance) {
      patternExplorerInstance.destroy();
    }

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

    patternExplorerInstance = new Chart(ctxExp, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Your Personal Journey',
            data: [94, 93, 92, 92, 91, 88, 86, 84],
            borderColor: '#4F46E5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: '#4F46E5',
            tension: 0.4
          },
          {
            label: 'Reference Envelope (Upper)',
            data: [96, 96, 95, 95, 95, 94, 94, 94],
            borderColor: 'rgba(139, 92, 246, 0.3)',
            borderWidth: 1,
            pointRadius: 0,
            tension: 0.4
          },
          {
            label: 'Reference Envelope (Lower)',
            data: [88, 88, 87, 87, 86, 86, 85, 85],
            borderColor: 'rgba(139, 92, 246, 0.3)',
            borderWidth: 1,
            backgroundColor: 'rgba(139, 92, 246, 0.08)',
            pointRadius: 0,
            tension: 0.4,
            fill: '-1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            padding: 12,
            cornerRadius: 12
          }
        },
        scales: {
          y: {
            min: 75,
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
            ticks: { font: { size: 11, weight: '600' }, color: '#64748B' }
          }
        }
      }
    });
  }

  const expBtns = document.querySelectorAll('#explorer-toggles .exp-btn');
  expBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      expBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-exp-filter');
      renderPatternExplorerChart(filter);
    });
  });

  renderPatternExplorerChart('overall');
});
