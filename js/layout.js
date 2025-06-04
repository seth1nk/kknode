document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.createElement('div');
    headerContainer.className = 'header-container';
    headerContainer.innerHTML = `
        <a class="pets-link" href="/audiotracks/index.html">Аудиотреки</a>
        <a class="pets-link" href="/">Главная</a>
        <a class="nutrition-link" href="/artists/index.html">Исполнители</a>
    `;
    document.body.insertBefore(headerContainer, document.body.firstChild);
});