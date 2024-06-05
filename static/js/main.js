const subcategorySelect = document.getElementById('subcategories');
const selectedList = document.getElementById('selected-list');
const recomendationsTable = document.getElementById('recommendations-list');
const recommendButton = document.getElementById('recommend-button');
const ctx = document.getElementById('chart');
let chart;

subcategorySelect.addEventListener('change', (event) => {
    const selectedSubcategory = event.target.value;

    if (selectedSubcategory) {
        const listItem = document.createElement('li');
        listItem.classList.add('subcategory');
        listItem.textContent = selectedSubcategory;
        selectedList.appendChild(listItem);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'x';
        removeButton.addEventListener('click', () => {
            selectedList.removeChild(listItem);
            subcategorySelect.add(new Option(selectedSubcategory, selectedSubcategory));
        });
        listItem.appendChild(removeButton);

        subcategorySelect.querySelector(`option[value="${selectedSubcategory}"]`).remove();
    }
});

recommendButton.addEventListener('click', () => {
    const selectedSubcategories = Array.from(selectedList.children).map(item => item.firstChild.textContent);

    const chartData = []
    const chartLabels = []

    fetch('/recommend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subcategories: selectedSubcategories })
    })
    .then(response => response.json())
    .then(data => {
        recomendationsTable.innerHTML = '';
        data.forEach(recommendation => {
            const row = document.createElement('tr');
            const category = document.createElement('th');
            const probability = document.createElement('td');
            const count = document.createElement('td');
            category.textContent = `${recommendation[0]}`
            probability.textContent = `${recommendation[1]}%`
            count.textContent = `${recommendation[2]}`
            row.appendChild(category)
            row.appendChild(probability)
            row.appendChild(count)
            recomendationsTable.appendChild(row);

            chartLabels.push(recommendation[0])
            chartData.push(recommendation[1])
        });

        createChart(chartData, chartLabels);
    });
});

function createChart(data, labels) {
    if(chart) {
        chart.destroy()
    }

    data = {
        labels: labels,
        datasets: [
          {
            label: 'Propensão de compra',
            data: data,
            backgroundColor: '#177FBF',
            borderWidth: 0
          }
        ]
    }
    const config = {
        type: 'bar',
        data: data,
        options: {
          maintainAspectRatio: false,
          indexAxis: 'y',
          elements: {
            bar: {
              borderWidth: 2,
            }, 
            scaleShowGridLines : false
          },
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: 'Recomendação por subcategoria (%)'
            }
          }
        },
      };

      chart = new Chart(ctx, config)
      console.log(config)

  
}