const API_KEY = "1d3a0eefa97b499d8fbc4ee93eeb40b7";
const url = "https://newsapi.org/v2/everything?q=";

let currentQuery = "India"; 
let currentPage = 1; 
let articlesPerPage = 5; 
let totalPages = 3; 

window.addEventListener("load", () => fetchNews(currentQuery));

function reload() {
    window.location.reload();
}

async function fetchNews(query) {
    const res = await fetch(`${url}${query}&apiKey=${API_KEY}`);
    const data = await res.json();
    distributeArticles(data.articles, query);
}

function distributeArticles(articles, query) {

    const paginatedArticles = [];
    const articlesPerPageCount = Math.ceil(articles.length / totalPages);

    for (let i = 0; i < articles.length; i += articlesPerPageCount) {
        paginatedArticles.push(articles.slice(i, i + articlesPerPageCount));
    }

    renderPage(paginatedArticles[currentPage - 1] || []);
    setupPagination(paginatedArticles, query);
}

function renderPage(articles) {
    const cardsContainer = document.getElementById("cards-container");
    const newsCardTemplate = document.getElementById("template-news-card");
    cardsContainer.innerHTML = ""; 

    articles.forEach((article) => {
        if (!article.urlToImage) return;
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");

    newsImg.src = article.urlToImage || "https://via.placeholder.com/400x200";
    newsTitle.innerHTML = article.title || "No title available";
    newsDesc.innerHTML = article.description || "No description available";

    const date = new Date(article.publishedAt || Date.now()).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });

    newsSource.innerHTML = `${article.source?.name || "Unknown Source"} · ${date}`;
    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

function setupPagination(paginatedArticles, query) {
    const paginationContainer = document.getElementById("pagination-container") || createPaginationContainer();
    paginationContainer.innerHTML = ""; 

  
    const prevButton = document.createElement("button");
    prevButton.textContent = "Previous";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(paginatedArticles[currentPage - 1]);
            setupPagination(paginatedArticles, query);
        }
    });
    paginationContainer.appendChild(prevButton);

    paginatedArticles.forEach((_, index) => {
        const pageButton = document.createElement("button");
        pageButton.textContent = index + 1;
        pageButton.className = currentPage === index + 1 ? "active-page" : "";
        pageButton.addEventListener("click", () => {
            currentPage = index + 1;
            renderPage(paginatedArticles[currentPage - 1]);
            setupPagination(paginatedArticles, query);
        });
        paginationContainer.appendChild(pageButton);
    });

    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = currentPage === paginatedArticles.length;
    nextButton.addEventListener("click", () => {
        if (currentPage < paginatedArticles.length) {
            currentPage++;
            renderPage(paginatedArticles[currentPage - 1]);
            setupPagination(paginatedArticles, query);
        }
    });
    paginationContainer.appendChild(nextButton);
}

function createPaginationContainer() {
    const container = document.createElement("div");
    container.id = "pagination-container";
    container.className = "pagination-container";
    document.body.appendChild(container);
    return container;
}

function onNavItemClick(id) {
    currentQuery = id;
    currentPage = 1; 
    fetchNews(id);
    const navItem = document.getElementById(id);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = navItem;
    curSelectedNav.classList.add("active");
}

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", () => {
    const query = searchText.value.trim();
    if (!query) return;
    currentQuery = query;
    currentPage = 1;
    fetchNews(query);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = null;
});
