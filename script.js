const API_KEY = "1d3a0eefa97b499d8fbc4ee93eeb40b7";
const url = "https://newsapi.org/v2/everything?q=";

let currentQuery = "India"; 
let currentPage = 1; 
let articlesPerPage = 12; 
let curSelectedNav = null;

window.addEventListener("load", () => fetchNews(currentQuery));

function reload() {
    window.location.reload();
}

async function fetchNews(query) {
    const cachedData = localStorage.getItem(query);

    if (cachedData) {
        const data = JSON.parse(cachedData);
        distributeArticles(data.articles, query);
    } else {
        const res = await fetch(`${url}${query}&apiKey=${API_KEY}`);
        const data = await res.json();
        localStorage.setItem(query, JSON.stringify(data));
        distributeArticles(data.articles, query);
    }
}

function distributeArticles(articles, query) {
    const totalPages = Math.ceil(articles.length / articlesPerPage);
    const paginatedArticles = [];
    for (let i = 0; i < articles.length; i += articlesPerPage) {
        paginatedArticles.push(articles.slice(i, i + articlesPerPage));
    }

    renderPage(paginatedArticles[currentPage - 1] || []);
    setupPagination(paginatedArticles, query, totalPages);
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

    cardsContainer.scrollTop = 0;
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");
    const readMore = cardClone.querySelector("#read-more");

    newsImg.src = article.urlToImage || "https://via.placeholder.com/400x200";
    newsTitle.innerHTML = article.title || "No title available";
    newsDesc.innerHTML = article.description || "No description available";

    const date = new Date(article.publishedAt || Date.now()).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });
    newsSource.innerHTML = `${article.source?.name || "Unknown Source"} · ${date}`;

    if (newsDesc.scrollHeight > newsDesc.clientHeight) {
        readMore.style.display = "inline";
        readMore.addEventListener("click", (e) => {
            e.preventDefault();
            newsDesc.style.whiteSpace = "normal";
            newsDesc.style.overflow = "visible";
            readMore.style.display = "none";
        });
    }

    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

function setupPagination(paginatedArticles, query, totalPages) {
    const paginationContainer = document.getElementById("pagination-container") || createPaginationContainer();
    paginationContainer.innerHTML = "";

    // Previous Button
    const prevButton = document.createElement("button");
    prevButton.textContent = "Previous";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(paginatedArticles[currentPage - 1]);
            setupPagination(paginatedArticles, query, totalPages);
        }
    });
    paginationContainer.appendChild(prevButton);

    // Page Buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.className = currentPage === i ? "active-page" : "";
        pageButton.addEventListener("click", () => {
            currentPage = i;
            renderPage(paginatedArticles[currentPage - 1]);
            setupPagination(paginatedArticles, query, totalPages);
        });
        paginationContainer.appendChild(pageButton);
    }

    // Next Button
    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPage(paginatedArticles[currentPage - 1]);
            setupPagination(paginatedArticles, query, totalPages);
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
