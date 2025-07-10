// --- DOM elements ---
const randomBtn = document.getElementById("random-btn");
const recipeDisplay = document.getElementById("recipe-display");
const savedRecipesContainer = document.getElementById("saved-recipes-container");
const savedRecipesList = document.getElementById("saved-recipes-list");

// This function creates a list of ingredients for the recipe from the API data
// It loops through the ingredients and measures, up to 20, and returns an HTML string
// that can be used to display them in a list format
// If an ingredient is empty or just whitespace, it skips that item 
function getIngredientsHtml(recipe) {
  let html = "";
  for (let i = 1; i <= 20; i++) {
    const ing = recipe[`strIngredient${i}`];
    const meas = recipe[`strMeasure${i}`];
    if (ing && ing.trim()) html += `<li>${meas ? `${meas} ` : ""}${ing}</li>`;
  }
  return html;
}

// This function displays the recipe on the page
function renderRecipe(recipe) {
  window.currentRecipe = recipe; // Store for remixing
  recipeDisplay.innerHTML = `
    <div class="recipe-title-row">
      <h2>${recipe.strMeal}</h2>
    </div>
    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
    <button id="ingredients-btn" class="accent-btn" style="margin-bottom:16px;">
      <span class="material-symbols-outlined icon-btn">restaurant_menu</span>
      Show Ingredients
    </button>
    <div id="ingredients-list" style="display:none;">
      <h3>Ingredients:</h3>
      <ul>${getIngredientsHtml(recipe)}</ul>
    </div>
    <h3>Instructions:</h3>
    <p>${recipe.strInstructions.replace(/\r?\n/g, "<br>")}</p>
    <button id="save-recipe-btn" class="main-btn" style="margin-top:16px;">
      <span class="material-symbols-outlined icon-btn">bookmark_add</span>
      Save Recipe
    </button>
  `;
  // Add event listener for Save Recipe button
  const saveBtn = document.getElementById("save-recipe-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveCurrentRecipe);
  }
  // Add event listener for Ingredients button
  const ingredientsBtn = document.getElementById("ingredients-btn");
  const ingredientsList = document.getElementById("ingredients-list");
  if (ingredientsBtn && ingredientsList) {
    ingredientsBtn.addEventListener("click", () => {
      // Toggle the ingredients list
      if (ingredientsList.style.display === "none") {
        ingredientsList.style.display = "block";
        ingredientsBtn.innerHTML = `<span class="material-symbols-outlined icon-btn">restaurant_menu</span>Hide Ingredients`;
      } else {
        ingredientsList.style.display = "none";
        ingredientsBtn.innerHTML = `<span class="material-symbols-outlined icon-btn">restaurant_menu</span>Show Ingredients`;
      }
    });
  }
}

// This function gets a random recipe from the API and shows it
async function fetchAndDisplayRandomRecipe() {
  recipeDisplay.innerHTML = "<p>Loading...</p>"; // Show loading message
  try {
    // Fetch a random recipe from the MealDB API
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const data = await res.json(); // Parse the JSON response
    const recipe = data.meals[0]; // Get the first recipe from the response
    renderRecipe(recipe); // Show the recipe on the page
  } catch (error) {
    recipeDisplay.innerHTML = "<p>Sorry, couldn't load a recipe.</p>";
  }
}

// This function fetches a recipe by meal name and displays it
// It uses the search API endpoint with the meal name as a query
async function fetchAndDisplayRecipeByName(mealName) {
  recipeDisplay.innerHTML = "<p>Loading...</p>";
  try {
    // Use the search endpoint with the meal name
    const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(mealName)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.meals && data.meals.length > 0) {
      renderRecipe(data.meals[0]);
    } else {
      recipeDisplay.innerHTML = `<p>No recipe found for "${mealName}".</p>`;
    }
  } catch (error) {
    recipeDisplay.innerHTML = "<p>Sorry, couldn't load a recipe.</p>";
  }
}

// This function fetches and displays all meals that start with a given first letter
async function fetchAndDisplayMealsByFirstLetter(letter) {
  recipeDisplay.innerHTML = "<p>Loading...</p>";
  try {
    // Use the search endpoint with the first letter
    const url = `https://www.themealdb.com/api/json/v1/1/search.php?f=${encodeURIComponent(letter)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.meals && data.meals.length > 0) {
      // Create a list of meal names and thumbnails
      let html = `<h3>Meals starting with "${letter.toUpperCase()}":</h3><ul>`;
      for (const meal of data.meals) {
        html += `
          <li>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width:50px;height:50px;vertical-align:middle;border-radius:6px;margin-right:8px;">
            <strong>${meal.strMeal}</strong>
          </li>
        `;
      }
      html += "</ul>";
      recipeDisplay.innerHTML = html;
    } else {
      recipeDisplay.innerHTML = `<p>No meals found starting with "${letter}".</p>`;
    }
  } catch (error) {
    recipeDisplay.innerHTML = "<p>Sorry, couldn't load meals.</p>";
  }
}

// This function fetches and displays a meal's full details by its ID
async function fetchAndDisplayMealById(mealId) {
  recipeDisplay.innerHTML = "<p>Loading...</p>";
  try {
    // Use the lookup endpoint with the meal ID
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(mealId)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.meals && data.meals.length > 0) {
      renderRecipe(data.meals[0]);
    } else {
      recipeDisplay.innerHTML = `<p>No meal found with ID "${mealId}".</p>`;
    }
  } catch (error) {
    recipeDisplay.innerHTML = "<p>Sorry, couldn't load meal details.</p>";
  }
}

// This function fetches and displays all meal categories
async function fetchAndDisplayMealCategories() {
  recipeDisplay.innerHTML = "<p>Loading...</p>";
  try {
    // Fetch all meal categories from the MealDB API
    const url = "https://www.themealdb.com/api/json/v1/1/categories.php";
    const res = await fetch(url);
    const data = await res.json();
    if (data.categories && data.categories.length > 0) {
      // Create a list of category names and thumbnails
      let html = `<h3>Meal Categories:</h3><ul>`;
      for (const category of data.categories) {
        html += `
          <li>
            <img src="${category.strCategoryThumb}" alt="${category.strCategory}" style="width:50px;height:50px;vertical-align:middle;border-radius:6px;margin-right:8px;">
            <strong>${category.strCategory}</strong> - ${category.strCategoryDescription.slice(0, 60)}...
          </li>
        `;
      }
      html += "</ul>";
      recipeDisplay.innerHTML = html;
    } else {
      recipeDisplay.innerHTML = "<p>No categories found.</p>";
    }
  } catch (error) {
    recipeDisplay.innerHTML = "<p>Sorry, couldn't load categories.</p>";
  }
}

// This function fetches and displays all meal categories (names only)
async function fetchAndDisplayAllCategories() {
  recipeDisplay.innerHTML = "<p>Loading categories...</p>";
  try {
    const url = "https://www.themealdb.com/api/json/v1/1/list.php?c=list";
    const res = await fetch(url);
    const data = await res.json();
    if (data.meals && data.meals.length > 0) {
      let html = "<h3>All Categories:</h3><ul>";
      for (const item of data.meals) {
        html += `<li>${item.strCategory}</li>`;
      }
      html += "</ul>";
      recipeDisplay.innerHTML = html;
    } else {
      recipeDisplay.innerHTML = "<p>No categories found.</p>";
    }
  } catch (error) {
    recipeDisplay.innerHTML = "<p>Sorry, couldn't load categories.</p>";
  }
}

// This function fetches and displays all meal areas (cuisines)
async function fetchAndDisplayAllAreas() {
  recipeDisplay.innerHTML = "<p>Loading areas...</p>";
  try {
    const url = "https://www.themealdb.com/api/json/v1/1/list.php?a=list";
    const res = await fetch(url);
    const data = await res.json();
    if (data.meals && data.meals.length > 0) {
      let html = "<h3>All Areas (Cuisines):</h3><ul>";
      for (const item of data.meals) {
        html += `<li>${item.strArea}</li>`;
      }
      html += "</ul>";
      recipeDisplay.innerHTML = html;
    } else {
      recipeDisplay.innerHTML = "<p>No areas found.</p>";
    }
  } catch (error) {
    recipeDisplay.innerHTML = "<p>Sorry, couldn't load areas.</p>";
  }
}

// This function fetches and displays all meal ingredients
async function fetchAndDisplayAllIngredients() {
  recipeDisplay.innerHTML = "<p>Loading ingredients...</p>";
  try {
    const url = "https://www.themealdb.com/api/json/v1/1/list.php?i=list";
    const res = await fetch(url);
    const data = await res.json();
    if (data.meals && data.meals.length > 0) {
      let html = "<h3>All Ingredients:</h3><ul>";
      // Only show the first 50 ingredients for simplicity
      for (let i = 0; i < Math.min(50, data.meals.length); i++) {
        html += `<li>${data.meals[i].strIngredient}</li>`;
      }
      html += "</ul>";
      recipeDisplay.innerHTML = html;
    } else {
      recipeDisplay.innerHTML = "<p>No ingredients found.</p>";
    }
  } catch (error) {
    recipeDisplay.innerHTML = "<p>Sorry, couldn't load ingredients.</p>";
  }
}

// This function fetches and displays meals filtered by a main ingredient
async function fetchAndDisplayMealsByIngredient(ingredient) {
  recipeDisplay.innerHTML = "<p>Loading...</p>";
  try {
    // Use the filter endpoint with the ingredient
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.meals && data.meals.length > 0) {
      // Create a list of meal names and thumbnails
      let html = `<h3>Meals with "${ingredient}":</h3><ul>`;
      for (const meal of data.meals) {
        html += `
          <li>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width:50px;height:50px;vertical-align:middle;border-radius:6px;margin-right:8px;">
            <strong>${meal.strMeal}</strong>
          </li>
        `;
      }
      html += "</ul>";
      recipeDisplay.innerHTML = html;
    } else {
      recipeDisplay.innerHTML = `<p>No meals found with ingredient "${ingredient}".</p>`;
    }
  } catch (error) {
    recipeDisplay.innerHTML = "<p>Sorry, couldn't load meals.</p>";
  }
}

// This function fetches and displays meals filtered by category
async function fetchAndDisplayMealsByCategory(category) {
  recipeDisplay.innerHTML = "<p>Loading...</p>";
  try {
    // Use the filter endpoint with the category
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.meals && data.meals.length > 0) {
      // Create a list of meal names and thumbnails
      let html = `<h3>Meals in category "${category}":</h3><ul>`;
      for (const meal of data.meals) {
        html += `
          <li>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width:50px;height:50px;vertical-align:middle;border-radius:6px;margin-right:8px;">
            <strong>${meal.strMeal}</strong>
          </li>
        `;
      }
      html += "</ul>";
      recipeDisplay.innerHTML = html;
    } else {
      recipeDisplay.innerHTML = `<p>No meals found in category "${category}".</p>`;
    }
  } catch (error) {
    recipeDisplay.innerHTML = "<p>Sorry, couldn't load meals.</p>";
  }
}

// This function fetches and displays meals filtered by area (cuisine)
async function fetchAndDisplayMealsByArea(area) {
  recipeDisplay.innerHTML = "<p>Loading...</p>";
  try {
    // Use the filter endpoint with the area
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.meals && data.meals.length > 0) {
      // Create a list of meal names and thumbnails
      let html = `<h3>Meals from "${area}":</h3><ul>`;
      for (const meal of data.meals) {
        html += `
          <li>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width:50px;height:50px;vertical-align:middle;border-radius:6px;margin-right:8px;">
            <strong>${meal.strMeal}</strong>
          </li>
        `;
      }
      html += "</ul>";
      recipeDisplay.innerHTML = html;
    } else {
      recipeDisplay.innerHTML = `<p>No meals found from area "${area}".</p>`;
    }
  } catch (error) {
    recipeDisplay.innerHTML = "<p>Sorry, couldn't load meals.</p>";
  }
}


// --- Remix Recipe with OpenAI ---

// This function sends the current recipe and remix theme to OpenAI and displays the remix
async function remixRecipeWithOpenAI(recipe, remixTheme) {
  const remixOutput = document.getElementById("remix-output");
  // Show a fun and friendly loading message while waiting for the AI
  remixOutput.innerHTML = "<p>✨ ChefBot is remixing your recipe... Hang tight for a tasty twist! 🍳🪄</p>";

  try {
    // Prepare the prompt for the AI
    const prompt = `
You are a creative chef AI. Given this recipe (in JSON) and a remix theme, write a short, fun, creative, and doable remix of the recipe. Highlight any changed ingredients or instructions.

Remix theme: ${remixTheme}

Recipe JSON:
${JSON.stringify(recipe, null, 2)}
`;

    // Call OpenAI's chat completions API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Use your OpenAI API key from secrets.js
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: "You are a helpful and creative chef assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.8
      })
    });

    if (!response.ok) throw new Error("OpenAI API request failed");

    const data = await response.json();
    const aiRemix = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
      ? data.choices[0].message.content
      : "Sorry, I couldn't remix this recipe.";

    // Replace the loading message with the AI's remixed recipe
    remixOutput.innerHTML = `<div class="remix-result">${aiRemix}</div>`;
  } catch (error) {
    // Show a simple, friendly error message if something goes wrong
    remixOutput.innerHTML = "<p>😅 Oops! Something went wrong while remixing your recipe. Please try again in a moment.</p>";
  }
}

// --- Event listeners for Remix button ---

// Add event listener for the Remix button
const remixBtn = document.getElementById("remix-btn");
const remixThemeSelect = document.getElementById("remix-theme");

if (remixBtn && remixThemeSelect) {
  remixBtn.addEventListener("click", () => {
    // Find the currently displayed recipe (assume last fetched random recipe)
    // For simplicity, store the last recipe globally when rendering
    if (window.currentRecipe) {
      const remixTheme = remixThemeSelect.value;
      remixRecipeWithOpenAI(window.currentRecipe, remixTheme);
    } else {
      document.getElementById("remix-output").innerHTML = "<p>No recipe to remix!</p>";
    }
  });
}

// Save the current recipe name to localStorage
function saveCurrentRecipe() {
  if (!window.currentRecipe || !window.currentRecipe.strMeal) return;
  const recipeName = window.currentRecipe.strMeal;
  let saved = JSON.parse(localStorage.getItem("savedRecipes") || "[]");
  if (!saved.includes(recipeName)) {
    saved.push(recipeName);
    localStorage.setItem("savedRecipes", JSON.stringify(saved));
    renderSavedRecipes();
  }
}

// Render the saved recipes list above the main recipe display
function renderSavedRecipes() {
  let saved = JSON.parse(localStorage.getItem("savedRecipes") || "[]");
  if (saved.length === 0) {
    savedRecipesContainer.style.display = "none";
    savedRecipesList.innerHTML = "";
    return;
  }
  savedRecipesContainer.style.display = "block";
  savedRecipesList.innerHTML = "";
  for (const name of saved) {
    const li = document.createElement("li");
    // Make the recipe name clickable
    const nameSpan = document.createElement("span");
    nameSpan.textContent = name;
    nameSpan.style.cursor = "pointer";
    nameSpan.style.textDecoration = "underline";
    nameSpan.style.color = "#2a6ebb";
    nameSpan.addEventListener("click", () => {
      // Fetch and display the full recipe details by name
      fetchAndDisplayRecipeByName(name);
    });

    // Create a Delete button for each saved recipe
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.addEventListener("click", () => {
      // Remove the recipe from localStorage and re-render the list
      let updated = saved.filter(r => r !== name);
      localStorage.setItem("savedRecipes", JSON.stringify(updated));
      renderSavedRecipes();
    });

    li.appendChild(nameSpan);
    li.appendChild(deleteBtn);
    savedRecipesList.appendChild(li);
  }
}

// --- Event listeners ---

// When the button is clicked, get and show a new random recipe
randomBtn.addEventListener("click", fetchAndDisplayRandomRecipe);

// When the page loads, show a random recipe right away and load saved recipes
window.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplayRandomRecipe();
  renderSavedRecipes();
});