// Cinematic AI Analysis Sequence Script

document.addEventListener('DOMContentLoaded', () => {
  const steps = [
    document.getElementById('step-proc-1'),
    document.getElementById('step-proc-2'),
    document.getElementById('step-proc-3'),
    document.getElementById('step-proc-4')
  ];

  steps.forEach(s => {
    if (s) {
      s.className = 'flex items-center space-x-3 text-slate-500';
      const check = s.querySelector('.step-check');
      if (check) {
        check.textContent = check.textContent.replace('✓', '');
        check.className = 'step-check w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]';
      }
    }
  });

  let currentStep = 0;
  const interval = setInterval(() => {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      if (step) {
        step.className = 'flex items-center space-x-3 text-emerald-400 font-bold transition-all';
        const check = step.querySelector('.step-check');
        if (check) {
          check.textContent = '✓';
          check.className = 'step-check w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-[10px]';
        }
      }
      currentStep++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        window.location.href = 'results.html';
      }, 1200);
    }
  }, 700);
});
