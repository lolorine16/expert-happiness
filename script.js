document.addEventListener('DOMContentLoaded', () => {
    // Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        
        if (body.classList.contains('dark-mode')) {
            themeToggle.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        }
    });

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = navLinks.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            menuToggle.textContent = isExpanded ? '✕' : '☰';
        });
    }

    const articlesContainer = document.getElementById('articles-container');
    const articleDetailContainer = document.getElementById('article-detail');

    // Helper to get URL parameters
    const getUrlParameter = (name) => {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    // Fetch articles
    let allArticles = []; // Store all articles globally

    fetch('data/articles.json')
        .then(response => response.json())
        .then(articles => {
            allArticles = articles; // Save for filtering
            if (articlesContainer) {
                displayArticles(articles);
            }
            if (articleDetailContainer) {
                const articleId = getUrlParameter('id');
                displaySingleArticle(articles, articleId);
            }
        })
        .catch(error => console.error('Error loading articles:', error));

    // Make filter function available globally
    window.filterArticles = function(category) {
        if (category === 'all') {
            displayArticles(allArticles);
        } else {
            const filtered = allArticles.filter(a => a.category === category);
            displayArticles(filtered);
        }
    };

    function displayArticles(articles) {
        articlesContainer.innerHTML = '';
        articles.forEach((article, index) => {
            const card = document.createElement('div');
            card.className = 'article-card';
            
            // Add animation with stagger delay
            card.style.opacity = '0'; // Start hidden
            card.style.animation = `popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`;
            card.style.animationDelay = `${index * 0.2}s`;

            card.innerHTML = `
                <img src="${article.image}" alt="${article.title}">
                <div class="article-content">
                    <span class="category-tag">${article.category.replace('-', ' ')}</span>
                    <h3 class="article-title">${article.title}</h3>
                    <p>${article.summary}</p>
                    <a href="article.html?id=${article.id}" class="read-more">START READING ▶</a>
                </div>
            `;
            articlesContainer.appendChild(card);
        });
    }

    function displaySingleArticle(articles, id) {
        const article = articles.find(a => a.id == id);
        
        if (!article) {
            articleDetailContainer.innerHTML = '<h2>Article not found!</h2><p>Maybe it got lost in the playground?</p>';
            return;
        }

        // Convert Google Drive link to embed format
        let videoEmbedUrl = '';
        if (article.videoUrl) {
            // Extract file ID from Google Drive URL
            const match = article.videoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
                videoEmbedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
            }
        }

        // Determine video orientation class
        const videoOrientation = article.videoOrientation || 'portrait';
        
        // Build HTML with or without video
        let contentHTML = `
            <h1>${article.title}</h1>
            <div class="article-meta">
                By <strong>${article.author}</strong> | ${article.date} | <span class="category-tag">${article.category.replace('-', ' ')}</span>
            </div>
        `;

        if (videoEmbedUrl) {
            // Layout with video side by side
            contentHTML += `
                <div class="article-with-video">
                    <div class="article-content-section">
                        <img src="${article.image}" alt="${article.title}">
                        <div class="article-body">
                            ${article.content}
                        </div>
                    </div>
                    <div class="article-video-section">
                        <div class="video-container ${videoOrientation}">
                            <iframe src="${videoEmbedUrl}" allow="autoplay"></iframe>
                        </div>
                        <p style="text-align: center; margin-top: 10px; font-size: 0.9rem;"><em>Watch the report!</em></p>
                    </div>
                </div>
            `;
        } else {
            // Layout without video (original)
            contentHTML += `
                <img src="${article.image}" alt="${article.title}">
                <div class="article-body">
                    ${article.content}
                </div>
            `;
        }

        contentHTML += `
            <br>
            <a href="index.html" class="read-more">◀ BACK TO LEVEL 1</a>
        `;

        articleDetailContainer.innerHTML = contentHTML;
    }

    // Mini Game Logic
    const gameArea = document.getElementById('game-area');
    const player = document.getElementById('player');
    const coin = document.getElementById('coin');
    const scoreDisplay = document.getElementById('game-score');
    const startBtn = document.getElementById('start-game-btn');
    
    let score = 0;
    let gameActive = false;
    let coinInterval;

    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }

    function startGame() {
        if (gameActive) return;
        gameActive = true;
        score = 0;
        scoreDisplay.innerText = score;
        startBtn.innerText = "PLAYING...";
        
        // Move player with mouse
        gameArea.addEventListener('mousemove', (e) => {
            const rect = gameArea.getBoundingClientRect();
            const x = e.clientX - rect.left;
            if (x > 0 && x < rect.width) {
                player.style.left = `${x}px`;
            }
        });

        dropCoin();
    }

    function dropCoin() {
        if (!gameActive) return;

        const rect = gameArea.getBoundingClientRect();
        const randomX = Math.floor(Math.random() * (rect.width - 20));
        coin.style.left = `${randomX}px`;
        coin.style.top = '-30px';
        
        let pos = -30;
        const speed = 2 + (score * 0.1); // Get faster as score increases

        coinInterval = setInterval(() => {
            if (!gameActive) {
                clearInterval(coinInterval);
                return;
            }

            pos += speed;
            coin.style.top = `${pos}px`;

            // Check collision
            const playerRect = player.getBoundingClientRect();
            const coinRect = coin.getBoundingClientRect();

            if (
                coinRect.bottom >= playerRect.top &&
                coinRect.top <= playerRect.bottom &&
                coinRect.right >= playerRect.left &&
                coinRect.left <= playerRect.right
            ) {
                // Caught!
                score++;
                scoreDisplay.innerText = score;
                clearInterval(coinInterval);
                dropCoin();
            } else if (pos > rect.height) {
                // Missed!
                gameOver();
            }
        }, 20);
    }

    function gameOver() {
        gameActive = false;
        clearInterval(coinInterval);
        startBtn.innerText = "GAME OVER - RESTART";
        alert(`Game Over! Your score: ${score}`);
    }

    // ===== NEW FEATURES =====
    
    // 1. Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);

    // Observe all article cards
    setTimeout(() => {
        document.querySelectorAll('.article-card').forEach(card => {
            card.classList.add('scroll-reveal');
            observer.observe(card);
        });
    }, 100);

    // 2. Confetti Effect on Button Click
    function createConfetti(x, y) {
        const colors = ['#7B68EE', '#87CEEB', '#FFB347', '#FF6B9D', '#4ECDC4'];
        const shapes = ['⭐', '✨', '🎉', '🎊', '💫', '🌟'];
        
        for (let i = 0; i < 15; i++) {
            const confetti = document.createElement('div');
            confetti.textContent = shapes[Math.floor(Math.random() * shapes.length)];
            confetti.style.position = 'fixed';
            confetti.style.left = x + 'px';
            confetti.style.top = y + 'px';
            confetti.style.fontSize = (Math.random() * 20 + 10) + 'px';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '10000';
            confetti.style.transition = 'all 1s ease-out';
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 200 + 50;
                confetti.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) rotate(${Math.random() * 360}deg)`;
                confetti.style.opacity = '0';
            }, 10);
            
            setTimeout(() => {
                confetti.remove();
            }, 1000);
        }
    }

    // Add confetti to "Read More" buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('read-more') || e.target.id === 'start-game-btn') {
            createConfetti(e.clientX, e.clientY);
        }
    });

    // 3. Favorites System
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    window.toggleFavorite = function(articleId) {
        const index = favorites.indexOf(articleId);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(articleId);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoriteButtons();
    };

    function updateFavoriteButtons() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const articleId = parseInt(btn.dataset.articleId);
            if (favorites.includes(articleId)) {
                btn.textContent = '❤️';
                btn.style.color = '#FF6B9D';
            } else {
                btn.textContent = '🤍';
            }
        });
    }

    // 4. Add shake effect to navigation links
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.add('shake-on-hover');
    });

    // 5. Add rainbow effect to title on hover
    document.querySelectorAll('header h1').forEach(title => {
        title.classList.add('rainbow-text');
    });

    // 6. Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 7. Add fun cursor trail effect
    let cursorTrail = [];
    const maxTrailLength = 5;

    document.addEventListener('mousemove', (e) => {
        if (Math.random() > 0.9) { // Only 10% of the time to avoid performance issues
            const trail = document.createElement('div');
            trail.textContent = '✨';
            trail.style.position = 'fixed';
            trail.style.left = e.clientX + 'px';
            trail.style.top = e.clientY + 'px';
            trail.style.pointerEvents = 'none';
            trail.style.fontSize = '12px';
            trail.style.zIndex = '9998';
            trail.style.transition = 'all 0.5s ease-out';
            trail.style.opacity = '0.7';
            
            document.body.appendChild(trail);
            cursorTrail.push(trail);
            
            setTimeout(() => {
                trail.style.opacity = '0';
                trail.style.transform = 'translateY(20px)';
            }, 10);
            
            setTimeout(() => {
                trail.remove();
                cursorTrail.shift();
            }, 500);
            
            if (cursorTrail.length > maxTrailLength) {
                const oldTrail = cursorTrail.shift();
                if (oldTrail) oldTrail.remove();
            }
        }
    });
});
