const broths = [];
const proteins = [];
let brothId;
let proteinId;
let brothPrice = 0;
let proteinPrice = 0;
let finalPrice = 0;

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

// Atualização do preço do pedido
function updateFinalPrice() {
    finalPrice = brothPrice + proteinPrice;
    const priceDisplay = document.querySelector('.priceDisplay');
    priceDisplay.innerHTML = `$${finalPrice.toFixed(2)}`;
}

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

                if (containerId.includes('Broths')) {
                    brothPrice = 0;
                } else if (containerId.includes('Proteins')) {
                    proteinPrice = 0;
                }
                updateFinalPrice();
            }

            this.classList.toggle('active');
            if (this.classList.contains('active')) {
                this.querySelector('img').src = item.imageActive;
                this.setAttribute('dataInactive', item.imageInactive);
                activeElement = this;

                if (containerId.includes('Broths')) {
                    brothId = item.id;
                    brothPrice = item.price;
                } else if (containerId.includes('Proteins')) {
                    proteinId = item.id;
                    proteinPrice = item.price;
                }

            } else {
                this.querySelector('img').src = item.imageInactive;
                if (containerId.includes('Broths')) {
                    brothId = null;
                    brothPrice = 0;
                } else if (containerId.includes('Proteins')) {
                    proteinId = null;
                    proteinPrice = 0;
                }
            }

            updateFinalPrice();

            updateOrderButton();

            console.log(finalPrice)
        });

        container.appendChild(element);
    });
}


// Envio do pedido
async function submitOrder() {
    const url = 'https://api.tech.redventures.com.br/orders';
    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': 'ZtVdh8XQ2U8pWI2gmZ7f796Vh8GllXoN7mr0djNf'
    };

    const body = JSON.stringify({
        brothId: brothId,
        proteinId: proteinId
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Order sent successfully:", result);

        document.querySelector('.sendOrder .btn').style.display = 'none';
        document.querySelector('.price').style.display = 'none';
        const successMessage = document.querySelector('.successMessage');
        successMessage.innerHTML = `<h2>Your order has been sent :)</h2>
                                     <a href="#" class="newOrder">Place a new order</a>`;
        document.querySelector('.sendOrder').appendChild(successMessage);

        document.querySelector('.newOrder').addEventListener('click', function() {
            window.location.reload();
        });
        
        resetOrder();
        
    } catch (error) {
        console.error("Error sending the order:", error);
    }
}

const orderButton = document.querySelector('.btn');
orderButton.addEventListener('click', submitOrder);

// Resetar valores para novos pedidos
function resetOrder() {
    document.querySelectorAll('.item.active').forEach(item => {
        item.classList.remove('active');
        item.querySelector('img').src = item.getAttribute('dataInactive');
    });
    brothId = null;
    proteinId = null;
    brothPrice = 0;
    proteinPrice = 0;
    updateFinalPrice();
}

// Verificar se os dois ingredientes foram selecionados
function updateOrderButton() {
    const orderButton = document.querySelector('.sendOrder .btn');
    const message = document.querySelector('.sendOrder .message');
    if (brothId && proteinId) {
        orderButton.disabled = false;
        message.style.visibility = 'hidden';
    } else {
        orderButton.disabled = true;
        message.style.visibility = 'visible';
    }
}


