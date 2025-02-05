// Wait for DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements we'll need
    const dropdown = document.getElementById('languageInput');
    const resultsDiv = document.getElementById('results');
    const searchButton = document.getElementById('searchButton');

    // Main function to fetch and display GitHub repositories
    function fetchGitHubRepositories(language) {
        // Clear previous results and show loading state
        resultsDiv.innerHTML = '';
        const loadingText = document.createElement('p');
        loadingText.className = 'results-text';
        loadingText.textContent = 'Loading please wait...';
        resultsDiv.appendChild(loadingText);
        
        // Hide refresh button during loading
        searchButton.style.display = 'none';
        
        // Set loading state styles
        resultsDiv.style.backgroundColor = '#eae7e7';
        resultsDiv.style.border = 'none';
        resultsDiv.style.width = '90%';
        resultsDiv.style.height = '100px';

        // Construct GitHub API URL - fetch top 30 repos for random selection
        const apiUrl = `https://api.github.com/search/repositories?q=language:${language}&sort=stars&order=desc&per_page=30`;

        fetch(apiUrl)
            .then(response => {
                // Check for rate limiting (GitHub API limit)
                if (response.status === 403) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                }
                if (!response.ok) throw new Error('Error fetching repository');
                return response.json();
            })
            .then(data => {
                if (data.items && data.items.length > 0) {
                    // Randomly select one repository from the top 30
                    const randomIndex = Math.floor(Math.random() * Math.min(data.items.length, 30));
                    const repo = data.items[randomIndex];
                    
                    // Helper function to truncate long descriptions
                    const truncateDescription = (text, maxLength = 100) => {
                        if (!text) return 'No description available';
                        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
                    };

                    // Clear loading state
                    resultsDiv.innerHTML = '';
                    
                    // Set success state styles
                    resultsDiv.style.backgroundColor = 'white';
                    resultsDiv.style.border = '2px solid black';
                    resultsDiv.style.width = 'auto';
                    resultsDiv.style.maxWidth = '90%';
                    resultsDiv.style.height = 'auto';
                    resultsDiv.style.minHeight = '100px';
                    
                    // Create and build repository info container using DOM methods
                    // This is more secure than using innerHTML
                    const repoInfo = document.createElement('div');
                    repoInfo.className = 'repo-info';

                    // Add arrow icon to top-right corner
                    const icon = document.createElement('i');
                    icon.className = 'fa-solid fa-angle-up';
                    repoInfo.appendChild(icon);

                    // Add repository title
                    const title = document.createElement('h3');
                    title.className = 'repo-title';
                    title.textContent = repo.name;
                    repoInfo.appendChild(title);

                    // Add truncated description
                    const description = document.createElement('p');
                    description.className = 'repo-description';
                    description.textContent = truncateDescription(repo.description);
                    repoInfo.appendChild(description);

                    // Create stats container for repository metrics
                    const statsDiv = document.createElement('div');
                    statsDiv.className = 'repo-stats';

                    // Define stats with their respective icons
                    const stats = [
                        { icon: '🔠', value: repo.language || 'Unknown' },
                        { icon: '⭐', value: repo.stargazers_count.toLocaleString() },
                        { icon: '🔱', value: repo.forks_count.toLocaleString() },
                        { icon: '👁', value: repo.watchers_count.toLocaleString() }
                    ];

                    // Add each stat to the stats container
                    stats.forEach(stat => {
                        const span = document.createElement('span');
                        span.textContent = `${stat.icon} ${stat.value}`;
                        statsDiv.appendChild(span);
                    });

                    // Assemble all components
                    repoInfo.appendChild(statsDiv);
                    resultsDiv.appendChild(repoInfo);
                    
                    // Show and style refresh button
                    searchButton.style.backgroundColor = 'black';
                    searchButton.textContent = 'Refresh';
                    searchButton.style.display = 'block';
                }
            })
            .catch(error => {
                // Handle any errors that occurred during fetch
                resultsDiv.innerHTML = '';
                const errorText = document.createElement('p');
                errorText.className = 'results-text';
                errorText.textContent = error.message || 'Error fetching repository';
                resultsDiv.appendChild(errorText);
                
                // Set error state styles
                resultsDiv.style.backgroundColor = '#ffebee';
                resultsDiv.style.border = 'none';
                resultsDiv.style.height = '100px';
                
                // Show and style retry button
                searchButton.style.display = 'block';
                searchButton.style.backgroundColor = '#dc3545';
                searchButton.textContent = 'Click to retry';
            });
    }

    // Load available languages into dropdown from JSON file
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

    // Event Listeners
    // Trigger repository fetch when language is selected
    dropdown.addEventListener('change', (e) => {
        if (e.target.value) {
            fetchGitHubRepositories(e.target.value);
        }
    });

    // Refresh button click handler
    searchButton.addEventListener('click', () => {
        if (dropdown.value) {
            fetchGitHubRepositories(dropdown.value);
        }
    });
}); 