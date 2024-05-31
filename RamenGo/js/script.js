const broths = [];
const proteins = [];

// Requisições da API
async function fetchData(url) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'ZtVdh8XQ2U8pWI2gmZ7f796Vh8GllXoN7mr0djNf'
            }
        });

        if (!response.ok) {
            throw new Error('Falha na requisição: ' + response.statusText);
        }

        const data = await response.json();
        return data;
    } catch (error) {
    console.error('Erro ao fazer a requisição:', error);
    }
}

fetchData('https://api.tech.redventures.com.br/broths')
    .then(data => {
        broths.push(...data);
        renderItems(broths, '.container-broths');
        console.log('Lista de Broths:', broths);
    })
    .catch(error => console.error('Não conseguimos obter os Broths:', error));

fetchData('https://api.tech.redventures.com.br/proteins')
    .then(data => {
        proteins.push(...data);
        renderItems(proteins, '.container-proteins');
        console.log('Lista de Proteins:', proteins);
    })
    .catch(error => console.error('Não conseguimos obter os Proteins:', error));


// Renderização dos ingredientes
function renderItems(items, containerId) {
    const container = document.querySelector(containerId);
    items.forEach(item => {
        const element = document.createElement('div');
        element.className = 'item';
        element.innerHTML = `<h2>${item.name}</h2>
                             <img src="${item.imageInactive}" alt="${item.name}" />
                             <p>${item.description}</p>
                             <h4>$${item.price}</h4>`;

        element.addEventListener('click', function() {
            this.classList.toggle('active');
            console.log('Selected ID:', item.id);
            this.querySelector('img').src = this.classList.contains('active') ? item.imageActive : item.imageInactive;
        });
        container.appendChild(element);
    });
}