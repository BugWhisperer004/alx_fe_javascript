let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only limit is your mind.", category: "Motivation" },
    { text: "Simplicity is the ultimate sophistication.", category: "Wisdom" },
];

async function fetchQuotesFromServer() {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await response.json();

    return data.slice(0, 5).map(post => ({
        text: post.title,
        category: 'Server'
    }));
}

async function postQuoteToServer(quote) {
    await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify(quote),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        }
    });
}

async function addQuote() {
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();
    if (!text || !category) return alert("Please fill in both fields.");

    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    alert("Quote added successfully!");
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';

    await postQuoteToServer(newQuote);
}

async function syncQuotes() {
    setInterval(async () => {
        const serverQuotes = await fetchQuotesFromServer();
        const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];

        // Only compare the 'text' values to keep things simple
        const serverTexts = serverQuotes.map(q => q.text).join(',');
        const localTexts = localQuotes.map(q => q.text).join(',');

        if (serverTexts !== localTexts) {
            document.getElementById('conflictResolution').style.display = 'block';
            document.getElementById('serverQuote').textContent = JSON.stringify(serverQuotes, null, 2);
            document.getElementById('localQuote').textContent = JSON.stringify(localQuotes, null, 2);

            document.getElementById('useServerBtn').onclick = () => {
                quotes = serverQuotes;
                saveQuotes();
                populateCategories();
                showRandomQuote();
                document.getElementById('conflictResolution').style.display = 'none';
            };

            document.getElementById('useLocalBtn').onclick = async () => {
                for (const q of localQuotes) {
                    await postQuoteToServer(q);
                }
                document.getElementById('conflictResolution').style.display = 'none';
            };
        }
    }, 10000);
}


// Event listener for 'Show New Quote' button
function showRandomQuote() {
    const category = localStorage.getItem('selectedCategory') || 'all';
    const filteredQuotes = category === 'all' ? quotes : quotes.filter(q => q.category === category);
    if (filteredQuotes.length === 0) return alert("No quotes in this category.");
    const quote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    document.getElementById('quoteDisplay').textContent = quote.text;
}

document.getElementById('newQuote').addEventListener('click', showRandomQuote);


function addQuote() {
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();
    if (!text || !category) return alert("Please fill in both fields.");

    quotes.push({ text, category });
    saveQuotes();
    saveToServer();
    populateCategories();
    alert("Quote added successfully!");
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
}

function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function saveToServer() {
    sessionStorage.setItem('serverQuotes', JSON.stringify(quotes));
}

saveToServer();

function populateCategories() {
    const select = document.getElementById('categoryFilter');
    const current = select.value;
    const categories = [...new Set(quotes.map(q => q.category))];
    select.innerHTML = `<option value="all">All Categories</option>`;
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
    select.value = current;
}

function filterQuotes() {
    const selected = document.getElementById('categoryFilter').value;
    localStorage.setItem('selectedCategory', selected);
    displayRandomQuote();
}

function exportQuotes() {
    const blob = new Blob([JSON.stringify(quotes)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "quotes.json";
    a.click();
}

function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
}

function createAddQuoteForm() {
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'controls';

    const quoteInput = document.createElement('input');
    quoteInput.id = 'newQuoteText';
    quoteInput.type = 'text';
    quoteInput.placeholder = 'Enter a new quote';

    const categoryInput = document.createElement('input');
    categoryInput.id = 'newQuoteCategory';
    categoryInput.type = 'text';
    categoryInput.placeholder = 'Enter quote category';

    const addButton = document.createElement('button');
    addButton.innerText = 'Add Quote';
    addButton.onclick = addQuote;

    controlsDiv.appendChild(quoteInput);
    controlsDiv.appendChild(categoryInput);
    controlsDiv.appendChild(addButton);

    document.body.appendChild(controlsDiv);
}

function fetchQuotesFromServer() {
    const serverData = sessionStorage.getItem('serverQuotes');
    return serverData ? JSON.parse(serverData) : [];
}

function syncQuotes() {
    setInterval(() => {
        const serverQuotes = fetchQuotesFromServer();
        const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];

        if (JSON.stringify(serverQuotes) !== JSON.stringify(localQuotes)) {
            // Show conflict resolution UI
            document.getElementById('conflictResolution').style.display = 'block';
            document.getElementById('serverQuote').textContent = JSON.stringify(serverQuotes, null, 2);
            document.getElementById('localQuote').textContent = JSON.stringify(localQuotes, null, 2);

            // Conflict resolution handlers
            document.getElementById('useServerBtn').onclick = () => {
                quotes = serverQuotes;
                saveQuotes();
                populateCategories();
                showRandomQuote();
                document.getElementById('conflictResolution').style.display = 'none';
            };

            document.getElementById('useLocalBtn').onclick = () => {
                saveToServer();
                document.getElementById('conflictResolution').style.display = 'none';
            };
        }
    }, 10000); // every 10 seconds
}



window.onload = () => {
    populateCategories();
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
        document.getElementById('categoryFilter').value = savedCategory;
    }
    showRandomQuote();
    createAddQuoteForm();
    syncQuotes();

};