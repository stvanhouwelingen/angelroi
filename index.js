
function binom(n, k) {
    var coeff = 1;
    for (var i = n-k+1; i <= n; i++) coeff *= i;
    for (var i = 1;     i <= k; i++) coeff /= i;
    return coeff;
}

Chart.defaults.global.legend.display = false;
function createChart(elementId, title)
{
  var ctx = document.getElementById(elementId).getContext('2d');
  var chart = new Chart(ctx, {
      type: 'bar',
      labels: [],
      data: {
        labels: [],
        datasets: [
          {
            label: "Probability (%)",
            backgroundColor: "#3e95cd",
            data: []
          }
        ]
      },
      options: {
          responsive: false,
          title: {
              display: true,
              text: title
          },
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:true
                  }
              }]
          }
      }
  });
  return chart;
}



var app2 = new Vue({
    el: '#app2',

    data: function()
    {
        var data = {
            investments: 5,
            multiple: 10,
            probability: 20,
            years: 8,
            multipleRanges: [
              0.0,
              0.5,
              1.0,
              1.5,
              2.0,
              2.5,
              3.0,
              3.5,
              4.0,
              4.5,
              5.0
            ],
            irrRanges: [
            -100,
            -50,
            -30,
            -20,
            -15,
            -10,
            -5,
             0,
             5,
             10,
             15,
             20,
             30,
             50,
             100
            ],
            backgroundColors: {
                'red' : 'rgba(255, 99, 132, 0.2)',
                'orange' : 'rgba(255, 159, 64, 0.2)',
                'green' : 'rgba(75, 192, 192, 0.2)'
            },
            borderColors: {
                'red' : 'rgba(255,99,132,1)',
                'orange' : 'rgba(255, 159, 64, 1)',
                'green' : 'rgba(75, 192, 192, 1)'
            },
            successesDataSet: {},
            successesChart,
            multipleDataset:  {},
            multipleChart,
            irrDataset: {},
            irrChart
        };

        return data;
    },
    created: function()
    {
      this.successesChart = createChart('successesChart', 'Probabilities number of successess (%)');
      this.multipleChart = createChart('multipleChart', 'Probabilities multiple range (%)');
      this.irrChart = createChart('irrChart', 'Probabilities IRR range (%)');
      this.computeProbabilities();
    },
    methods: {
      inputChanged: function()
      {
        this.computeProbabilities();
      },
      updateChart: function(chart, dataset)
      {
        chart.data.labels = dataset['labels'];
        chart.data.datasets[0].data = dataset['data'];
        if(dataset['backgroundColor']) {
          chart.data.datasets[0].backgroundColor = dataset['backgroundColor'];
        }
        if(dataset['borderColor']) {
          chart.data.datasets[0].borderColor = dataset['borderColor'];
        }
        chart.update();
      },
      initializeSuccessesDataset: function()
      {
        var n = this.investments + 1;
        this.successesDataSet = {
          'labels' : new Array(n),
          'data' : new Array(n)
        };
        for(var i=0;i<n;i++)
        {
          this.successesDataSet['labels'][i] = i.toString();
        }
      },
      initializeMultipleDataset: function()
      {
        var n = this.multipleRanges.length;
        this.multipleDataset = {
          'labels' : new Array(n),
          'data' : new Array(n),
          'backgroundColor' : new Array(n),
          'borderColor' : new Array(n)
        };
        for(var i=0;i<n;i++)
        {
          var min = this.multipleRanges[i];
          this.multipleDataset['labels'][i] = i<(n-1) ?
            min + ' - ' + this.multipleRanges[i+1] :
            '>' + min;
          this.multipleDataset['data'][i] = 0;
          var color = 'green';
          if(min<1)
          {
            color = 'red';
          }
          else if (min<2) {
            color = 'orange'
          }
          this.multipleDataset['backgroundColor'][i] = this.backgroundColors[color];
          this.multipleDataset['borderColor'][i] = this.borderColors[color];
        }
      },
      initializeIrrDataset: function()
      {
        var n = this.irrRanges.length;
        this.irrDataset = {
          'labels' : new Array(n),
          'data' : new Array(n),
          'backgroundColor' : new Array(n),
          'borderColor' : new Array(n)
        };
        for(var i=0;i<n;i++)
        {
          var min = this.irrRanges[i];
          this.irrDataset['labels'][i] = i<(n-1) ?
            min + ' to ' + this.irrRanges[i+1] + '%':
            '>' + min;
          this.irrDataset['data'][i] = 0;
          var color = 'green';
          if(min<0)
          {
            color = 'red';
          }
          else if (min<15) {
            color = 'orange'
          }
          this.irrDataset['backgroundColor'][i] = this.backgroundColors[color];
          this.irrDataset['borderColor'][i] = this.borderColors[color];
        }
      },
      addToDataset: function(dataset,ranges,value,p)
      {
        var found = false;
        for(var j=1;j<ranges.length;j++)
        {
          if(ranges[j] >= value)
          {
            dataset['data'][j-1] += p;
            found = true;
            break;
          }
        }
        if(!found)
        {
          dataset['data'][ranges.length-1] += p;
        }
      },
      computeProbabilities: function()
      {
        var probSuccess = this.probability / 100.0;
        var probFail = 1 - probSuccess;
        var meanMultiple = probSuccess * this.multiple;
        this.initializeSuccessesDataset();
        this.initializeMultipleDataset();
        this.initializeIrrDataset();
        for(var i=0;i<=this.investments;i++)
        {
          var p = 100.0 * binom(this.investments,i) *
            Math.pow(probSuccess,i) * Math.pow(probFail,this.investments-i);
          this.successesDataSet['data'][i] = p;
          var totalMutiple = i * this.multiple / this.investments;
          this.addToDataset(this.multipleDataset, this.multipleRanges, totalMutiple, p);
          var totalIrr = 100.0 * (Math.pow(totalMutiple, 1/this.years) - 1.0)
          this.addToDataset(this.irrDataset, this.irrRanges, totalIrr, p);
        }
        this.updateChart(this.successesChart, this.successesDataSet);
        this.updateChart(this.multipleChart, this.multipleDataset);
        this.updateChart(this.irrChart, this.irrDataset);
      }
    }
});
