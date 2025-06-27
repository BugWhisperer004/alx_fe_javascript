let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only limit is your mind.", category: "Motivation" },
    { text: "Simplicity is the ultimate sophistication.", category: "Wisdom" },
];

// Event listener for 'Show New Quote' button
function showRandomQuote() {
    const category = localStorage.getItem('selectedCategory') || 'all';
    const filteredQuotes = category === 'all' ? quotes : quotes.filter(q => q.category === category);
    if (filteredQuotes.length === 0) return alert("No quotes in this category.");
    const quote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    document.getElementById('quoteDisplay').innerText = quote.text;
}

document.getElementById('newQuote').addEventListener('click', showRandomQuote);


function addQuote() {
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();
    if (!text || !category) return alert("Please fill in both fields.");

    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    alert("Quote added successfully!");
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
}

function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function populateCategories() {
    const select = document.getElementById('categoryFilter');
    const current = select.value;
    const categories = [...new Set(quotes.map(q => q.category))];
    select.innerHTML = `<option value="all">All Categories</option>`;
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.innerText = cat;
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

window.onload = () => {
    populateCategories();
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) document.getElementById('categoryFilter').value = savedCategory;
    showRandomQuote();
};
