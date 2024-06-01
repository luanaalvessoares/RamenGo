const broths = [];
const proteins = [];
let brothId;
let proteinId;

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
        renderItems(broths, '.containerBroths', brothId);
        console.log('Lista de Broths:', broths);
    })
    .catch(error => console.error('Não conseguimos obter os Broths:', error));

fetchData('https://api.tech.redventures.com.br/proteins')
    .then(data => {
        proteins.push(...data);
        renderItems(proteins, '.containerProteins', proteinId);
        console.log('Lista de Proteins:', proteins);
    })
    .catch(error => console.error('Não conseguimos obter os Proteins:', error));


// Renderização dos ingredientes
// Renderização dos ingredientes
function renderItems(items, containerId) {
    const container = document.querySelector(containerId);
    let activeElement = null;

    items.forEach(item => {
        const element = document.createElement('div');
        element.className = 'item';
        element.innerHTML = `<h2>${item.name}</h2>
                             <img src="${item.imageInactive}" alt="${item.name}" />
                             <p>${item.description}</p>
                             <h4>$${item.price}</h4>`;

        element.addEventListener('click', function() {
            if (activeElement && activeElement !== this) {
                activeElement.classList.remove('active');
                activeElement.querySelector('img').src = activeElement.getAttribute('dataInactive');
            }

            this.classList.toggle('active');
            if (this.classList.contains('active')) {
                this.querySelector('img').src = item.imageActive;
                this.setAttribute('dataInactive', item.imageInactive);
                activeElement = this;
                // Atualiza diretamente a variável externa apropriada
                if (containerId.includes('Broths')) {
                    brothId = item.id;
                } else if (containerId.includes('Proteins')) {
                    proteinId = item.id;
                }
            } else {
                this.querySelector('img').src = item.imageInactive;
                if (containerId.includes('Broths')) {
                    brothId = null;
                } else if (containerId.includes('Proteins')) {
                    proteinId = null;
                }
            }

            console.log('Selected ID:', item.id);
        });

        container.appendChild(element);
    });
}
