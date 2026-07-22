const apiUrl = 'https://www.themealdb.com/api/json/v1/1';
const recipeGrid = document.getElementById('recipeGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsTitle = document.getElementById('resultsTitle');
const loader = document.getElementById('loader');
const noResults = document.getElementById('noResults');
const mainContent = document.getElementById('mainContent');
const recipeDetailsView = document.getElementById('recipeDetailsView');
const logo = document.querySelector('.logo');

// Event Listeners
searchBtn.addEventListener('click', () => searchRecipes(searchInput.value));
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchRecipes(searchInput.value);
});
logo.addEventListener('click', () => {
    searchInput.value = '';
    showMainView();
    loadFeaturedRecipes();
});

// Load featured recipes on start
async function loadFeaturedRecipes() {
    resultsTitle.textContent = "Featured Recipes";
    recipeGrid.innerHTML = '';
    showLoader();
    
    try {
        // Fetch 8 random recipes since there's no single endpoint for multiple randoms
        const promises = Array.from({ length: 8 }).map(() => 
            fetch(`${apiUrl}/random.php`).then(res => res.json())
        );
        const results = await Promise.all(promises);
        const meals = results.map(data => data.meals[0]);
        displayRecipes(meals);
    } catch (error) {
        console.error("Error loading featured recipes:", error);
        showNoResults();
    }
}

async function searchRecipes(query) {
    if (!query.trim()) return;
    
    showMainView();
    resultsTitle.textContent = `Search results for "${query}"`;
    recipeGrid.innerHTML = '';
    showLoader();
    
    try {
        const response = await fetch(`${apiUrl}/search.php?s=${query}`);
        const data = await response.json();
        
        if (data.meals) {
            displayRecipes(data.meals);
        } else {
            showNoResults();
        }
    } catch (error) {
        console.error("Error searching recipes:", error);
        showNoResults();
    }
}

function displayRecipes(meals) {
    hideLoader();
    noResults.classList.add('hidden');
    recipeGrid.innerHTML = '';
    
    meals.forEach((meal, index) => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="recipe-img-container">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="recipe-img" loading="lazy">
                <div class="recipe-category">${meal.strCategory}</div>
            </div>
            <div class="recipe-info">
                <h3 class="recipe-title">${meal.strMeal}</h3>
                <div class="recipe-area">
                    <i class="fa-solid fa-earth-americas"></i> ${meal.strArea}
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => fetchRecipeDetails(meal.idMeal));
        recipeGrid.appendChild(card);
    });
}

async function fetchRecipeDetails(id) {
    showLoader();
    try {
        const response = await fetch(`${apiUrl}/lookup.php?i=${id}`);
        const data = await response.json();
        if (data.meals) {
            showRecipeDetails(data.meals[0]);
        }
    } catch (error) {
        console.error("Error fetching recipe details:", error);
    }
    hideLoader();
}

function showRecipeDetails(meal) {
    // Hide main content, show details
    mainContent.classList.add('hidden');
    recipeDetailsView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Extract ingredients and measures
    let ingredientsHtml = '';
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        
        if (ingredient && ingredient.trim() !== '') {
            ingredientsHtml += `
                <li>
                    <span>${ingredient}</span>
                    <span class="measure">${measure}</span>
                </li>
            `;
        }
    }

    const tagsHtml = meal.strTags 
        ? meal.strTags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')
        : '';

    const youtubeBtnHtml = meal.strYoutube 
        ? `<a href="${meal.strYoutube}" target="_blank" class="video-btn"><i class="fa-brands fa-youtube"></i> Watch Tutorial</a>`
        : '';

    recipeDetailsView.innerHTML = `
        <button class="back-btn" onclick="showMainView()">
            <i class="fa-solid fa-arrow-left"></i> Back to Recipes
        </button>
        
        <div class="detail-header">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="detail-img">
            <div class="detail-info">
                <h2 class="detail-title">${meal.strMeal}</h2>
                <div class="tags-container">
                    <span class="tag"><i class="fa-solid fa-earth-americas"></i> ${meal.strArea}</span>
                    <span class="tag"><i class="fa-solid fa-utensils"></i> ${meal.strCategory}</span>
                    ${tagsHtml}
                </div>
                
                <h3 class="ingredients-title">Ingredients</h3>
                <ul class="ingredients-list">
                    ${ingredientsHtml}
                </ul>
                ${youtubeBtnHtml}
            </div>
        </div>
        
        <div class="instructions-section">
            <h3>Instructions</h3>
            <div class="instructions-text">${meal.strInstructions}</div>
        </div>
    `;
}

function showMainView() {
    recipeDetailsView.classList.add('hidden');
    mainContent.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showLoader() {
    loader.classList.remove('hidden');
    recipeGrid.innerHTML = '';
    noResults.classList.add('hidden');
}

function hideLoader() {
    loader.classList.add('hidden');
}

function showNoResults() {
    hideLoader();
    recipeGrid.innerHTML = '';
    noResults.classList.remove('hidden');
}

// Initialize
loadFeaturedRecipes();
