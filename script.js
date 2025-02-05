// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.getElementById('languageInput');
    const resultsDiv = document.getElementById('results');
    const searchButton = document.getElementById('searchButton');

    function fetchGitHubRepositories(language) {
        // Clear everything and show loading
        resultsDiv.innerHTML = '';
        resultsDiv.classList.add('loading');
        const loadingText = document.createElement('p');
        loadingText.className = 'results-text';
        loadingText.textContent = 'Loading please wait...';
        resultsDiv.appendChild(loadingText);
        
        // Hide button during loading
        searchButton.style.display = 'none';
        
        resultsDiv.style.backgroundColor = '#eae7e7';
        resultsDiv.style.border = 'none';
        resultsDiv.style.width = '90%';
        resultsDiv.style.height = '100px';

        const apiUrl = `https://api.github.com/search/repositories?q=language:${language}&sort=stars&order=desc&per_page=30`;

        fetch(apiUrl)
            .then(response => {
                if (response.status === 403) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                }
                if (!response.ok) throw new Error('Error fetching repository');
                return response.json();
            })
            .then(data => {
                if (data.items && data.items.length > 0) {
                    resultsDiv.classList.remove('loading');
                    const randomIndex = Math.floor(Math.random() * Math.min(data.items.length, 30));
                    const repo = data.items[randomIndex];
                    
                    // Clear everything again before showing results
                    resultsDiv.innerHTML = '';
                    
                    // Change results box styling
                    resultsDiv.style.backgroundColor = 'white';
                    resultsDiv.style.border = '2px solid black';
                    resultsDiv.style.width = 'auto';
                    resultsDiv.style.maxWidth = '90%';
                    resultsDiv.style.height = 'auto';
                    resultsDiv.style.minHeight = '100px';
                    
                    // Create and display repository info
                    const repoInfo = document.createElement('div');
                    const truncateDescription = (text, maxLength = 100) => {
                        if (!text) return 'No description available';
                        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
                    };

                    repoInfo.className = 'repo-info';

                    const icon = document.createElement('i');
                    icon.className = 'fa-solid fa-angle-up';
                    repoInfo.appendChild(icon);

                    const title = document.createElement('h3');
                    title.className = 'repo-title';
                    title.textContent = repo.name;
                    repoInfo.appendChild(title);

                    const description = document.createElement('p');
                    description.className = 'repo-description';
                    description.textContent = truncateDescription(repo.description);
                    repoInfo.appendChild(description);

                    const statsDiv = document.createElement('div');
                    statsDiv.className = 'repo-stats';

                    const stats = [
                        { icon: '🔠', value: repo.language || 'Unknown' },
                        { icon: '⭐', value: repo.stargazers_count.toLocaleString() },
                        { icon: '🔱', value: repo.forks_count.toLocaleString() },
                        { icon: '👁', value: repo.watchers_count.toLocaleString() }
                    ];

                    stats.forEach(stat => {
                        const span = document.createElement('span');
                        span.textContent = `${stat.icon} ${stat.value}`;
                        statsDiv.appendChild(span);
                    });

                    repoInfo.appendChild(statsDiv);
                    resultsDiv.appendChild(repoInfo);
                    
                    searchButton.style.backgroundColor = 'black';
                    searchButton.textContent = 'Refresh';
                    searchButton.style.display = 'block';
                }
            })
            .catch(error => {
                resultsDiv.innerHTML = '';
                const errorText = document.createElement('p');
                errorText.className = 'results-text';
                errorText.textContent = /* error.message || */ 'Error fetching repository';
                resultsDiv.appendChild(errorText);
                
                resultsDiv.style.backgroundColor = '#ffebee';
                resultsDiv.style.border = 'none';
                resultsDiv.style.height = '100px';
                
                // Show and style error button
                searchButton.style.display = 'block';
                searchButton.style.backgroundColor = '#dc3545';
                searchButton.textContent = 'Click to retry';
            });
    }

    // Load languages into dropdown
    fetch('languages.json')
        .then(response => response.json())
        .then(languages => {
            languages.forEach(language => {
                const option = document.createElement('option');
                option.value = language.value;
                option.textContent = language.title;
                dropdown.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading the JSON:', error));

    // Language selection event
    dropdown.addEventListener('change', (e) => {
        if (e.target.value) { // Only fetch if a language is selected
            fetchGitHubRepositories(e.target.value);
        }
    });

    // Refresh button event
    searchButton.addEventListener('click', () => {
        if (dropdown.value) {
            fetchGitHubRepositories(dropdown.value);
        }
    });
}); 