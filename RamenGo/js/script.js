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
    .then(data => console.log('Lista de Broths:', data))
    .catch(error => console.error('Não conseguimos obter os Broths:', error));