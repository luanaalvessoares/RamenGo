const broths = [];
const proteins = [];
let brothId;
let proteinId;
let brothPrice = 0;
let proteinPrice = 0;
let finalPrice = 0;
let container = document.querySelector('.container');
let loading = document.querySelector('.loading');
let reloadPage = document.querySelector('.reloadPage');

// Carregamento de todos os elementos da página
function waitForBackgroundImages() {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            const allElements = document.querySelectorAll('*');
            let allLoaded = true;
            for (let el of allElements) {
                const style = window.getComputedStyle(el);
                if (style.backgroundImage !== 'none') {
                    const bgImage = style.backgroundImage.match(/url\("?(.+?)"?\)/)[1];
                    const img = new Image();
                    img.src = bgImage;
                    if (!img.complete) {
                        allLoaded = false;
                        break;
                    }
                }
            }
            if (allLoaded) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);
    });
}

// Requisições da API
async function fetchData(url, callback) {
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
        await loadAllImages(data);
        // await waitForBackgroundImages();
        callback(data);

        loading.style.display = 'none';
        container.style.display = 'block';

    } catch (error) {
        console.error('Erro ao fazer a requisição:', error);
        reloadPage.style.display = 'flex';
        loading.style.display = 'none';
    }
}

fetchData('https://api.tech.redventures.com.br/broths', data => {
    broths.push(...data);
    renderItems(broths, '.containerBroths', brothId);
});

fetchData('https://api.tech.redventures.com.br/proteins', data => {
    proteins.push(...data);
    renderItems(proteins, '.containerProteins', proteinId);
});

// Função para garantia de carregamento das imagens
async function loadAllImages(items) {
    const promises = items.map(item => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = item.imageInactive;
        });
    });
    await Promise.all(promises);
}

// Atualização do preço do pedido
function updateFinalPrice(containerPrice) {
    finalPrice = brothPrice + proteinPrice;
    const priceDisplay = document.querySelector(containerPrice);
    priceDisplay.innerHTML = `US$ ${finalPrice.toFixed(2)}`;
}

// Renderização dos ingredientes
function renderItems(items, containerId) {
    const container = document.querySelector(containerId);
    let activeElement = null;

    items.forEach(item => {
        const element = document.createElement('div');
        element.className = 'item';
        element.innerHTML = `<img src="${item.imageInactive}" alt="${item.name}" />
                             <h2>${item.name}</h2>
                             <p>${item.description}</p>
                             <h4>US$ ${item.price}</h4>`;

        element.addEventListener('click', function() {
            if (activeElement && activeElement !== this) {
                activeElement.classList.remove('active');
                activeElement.querySelector('img').src = activeElement.getAttribute('dataInactive');

                if (containerId.includes('Broths')) {
                    brothPrice = 0;
                } else if (containerId.includes('Proteins')) {
                    proteinPrice = 0;
                }
                updateFinalPrice('.priceDisplay');
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

            updateFinalPrice('.priceDisplay');

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

    document.querySelector('.sendOrder .btn').style.display = 'none';
    document.querySelector('.price').style.display = 'none';
    document.querySelector('.boxIngredients').style.pointerEvents = 'none';

    document.querySelector('.loadingOrder').style.display = 'block';

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


        const selectedProtein = proteins.find(p => p.id === proteinId);
        const selectedBroth = broths.find(b => b.id === brothId);

        const dishName = `${selectedBroth.name} and ${selectedProtein.name} Ramen`;
        const imagePath = getImagePath(selectedProtein.name);

        let orderSentDiv = document.getElementById('orderSent');
        orderSentDiv.insertAdjacentHTML('beforeend', `<img src="${imagePath}" alt="${dishName}" />
                                                       <p class="orderDescription">Your Order:</p>
                                                       <h2>${dishName}</h2>
                                                       <p class="orderFinalPrice">US$ ${finalPrice.toFixed(2)}</p>`);        

        document.querySelector('.orderSuccess').style.display = 'grid';
        document.querySelector('.container').style.display = 'none';
        document.querySelector('.orderSuccess').scrollIntoView({
            behavior: 'smooth'
        });

        document.querySelector('.newOrder').addEventListener('click', function() {
            window.location.reload();
        });
        
    } catch (error) {
        console.error("Error sending the order:", error);
    }
}

const orderButton = document.querySelector('.btn');
orderButton.addEventListener('click', submitOrder);

// Obter o caminho da imagem da escolha do ramen
function getImagePath(proteinName) {
    switch (proteinName) {
        case 'Chasu': return '/assets/images/chasu.webp';
        case 'Yasai Vegetarian': return '/assets/images/yasaiVegetable.webp';
        case 'Karaague': return '/assets/images/karaague.webp';
    }
}

document.querySelector('.orderSuccess').scrollIntoView({
    behavior: 'smooth'
});

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
    updateFinalPrice('.priceDisplay');
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

// Rolagem para a seção dos ingredientes
document.querySelector('.scrollToMenu').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('menuSection').scrollIntoView({
        behavior: 'smooth'
    });
});


// teste carrossel dos ingredientes mobile
document.querySelectorAll('.scroll-container').forEach(container => {
    container.addEventListener('scroll', function() {
        const scrollPosition = this.scrollLeft;
        const itemWidth = this.querySelector('.item').offsetWidth;
        const index = Math.floor(scrollPosition / itemWidth);

        const indicators = this.parentNode.querySelector('.indicators').children;
        Array.from(indicators).forEach((dot, idx) => {
            dot.classList.toggle('active', idx === index);
        });
    });
});

  