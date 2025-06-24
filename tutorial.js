document.addEventListener('DOMContentLoaded', () => {
    const articleListContainer = document.getElementById('article-list-container');

    if (articleListContainer) {
        fetch('articles.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(articles => {
                // Sort articles by date, newest first
                articles.sort((a, b) => new Date(b.date) - new Date(a.date));

                let articlesHTML = '';
                articles.forEach(article => {
                    const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    articlesHTML += `
                        <article class="article-item">
                            <h3><a href="articles/${article.file}">${article.title}</a></h3>
                            <p class="article-meta">Published on <time datetime="${article.date}">${formattedDate}</time></p>
                            <p class="article-excerpt">${article.excerpt}</p>
                            <a href="articles/${article.file}" class="read-more">Read More &rarr;</a>
                        </article>
                    `;
                });
                articleListContainer.innerHTML = articlesHTML;
            })
            .catch(error => {
                console.error('Error fetching or parsing articles:', error);
                articleListContainer.innerHTML = '<p>Sorry, we were unable to load the articles. Please try again later.</p>';
            });
    }
}); 