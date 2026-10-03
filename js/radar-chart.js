/* ============================================================
   DEXPULSE INTERACTIVE RADAR STAT CHART (CHART.JS)
   ============================================================ */

window.DexChart = (function () {
  let chartInstance = null;

  const statKeys = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
  const statLabels = ['HP', 'ATK', 'DEF', 'SP.ATK', 'SP.DEF', 'SPD'];

  function initOrUpdateChart(statsArray) {
    const canvas = document.getElementById('statRadarCanvas');
    if (!canvas) return;

    // Map stats array into correct order
    const values = statKeys.map(key => {
      const found = statsArray.find(s => s.stat.name === key);
      return found ? found.base_stat : 0;
    });

    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded yet');
      return;
    }

    if (chartInstance) {
      chartInstance.data.datasets[0].data = values;
      const maxVal = Math.max(...values, 140);
      chartInstance.options.scales.r.suggestedMax = Math.min(255, Math.ceil(maxVal / 20) * 20);
      chartInstance.update();
      return;
    }

    const maxVal = Math.max(...values, 140);
    const dynamicMax = Math.min(255, Math.ceil(maxVal / 20) * 20);

    const ctx = canvas.getContext('2d');
    chartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: statLabels,
        datasets: [{
          label: 'Base Stats',
          data: values,
          backgroundColor: 'rgba(231, 76, 60, 0.35)',
          borderColor: '#e74c3c',
          borderWidth: 2,
          pointBackgroundColor: '#ff6b6b',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#e74c3c',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: {
              color: 'rgba(143, 160, 184, 0.25)'
            },
            grid: {
              color: 'rgba(143, 160, 184, 0.2)'
            },
            pointLabels: {
              color: '#dce8f5',
              font: {
                family: 'Share Tech Mono',
                size: 11
              }
            },
            ticks: {
              display: false,
              stepSize: 50
            },
            suggestedMin: 0,
            suggestedMax: dynamicMax
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#142238',
            titleFont: { family: 'Orbitron', size: 12 },
            bodyFont: { family: 'Share Tech Mono', size: 11 },
            borderColor: '#e74c3c',
            borderWidth: 1,
            displayColors: false,
            callbacks: {
              label: function (context) {
                return `Stat: ${context.raw}`;
              }
            }
          }
        }
      }
    });
  }

  return {
    initOrUpdateChart
  };
})();
