const baseURL = "http://localhost:3000/posts";
let currentPostId = null;

// Fetch and display all posts
function displayPosts() {
  fetch(baseURL)
    .then((res) => res.json())
    .then((posts) => {
      const postsContainer = document.getElementById("posts");
      const countText = document.getElementById("post-count");

      postsContainer.innerHTML = ""; // Clear list
      countText.textContent = `${posts.length} post${posts.length !== 1 ? "s" : ""}`;

      posts.forEach((post) => {
        const li = document.createElement("li");
        li.textContent = post.title;
        li.style.cursor = "pointer";
        li.style.padding = "8px 0";
        li.style.borderBottom = "1px solid #ddd";

        li.addEventListener("click", () => handlePostClick(post.id));
        postsContainer.appendChild(li);
      });

      // auto-show first post
      if (posts.length > 0) {
        handlePostClick(posts[0].id);
      }
    })
    .catch((err) => console.error("Error loading posts:", err));
}

// Show post details
function handlePostClick(postId) {
  currentPostId = postId;

  fetch(`${baseURL}/${postId}`)
    .then((res) => res.json())
    .then((post) => {
      const detail = document.getElementById("post-detail");

      detail.innerHTML = `
        <h2>${post.title}</h2>
        <p><strong>By ${post.author}</strong> - ${post.date || "2024-01-01"}</p>
        <img src="${post.image || 'https://via.placeholder.com/600x300'}" style="max-width:100%; margin:10px 0;">
        <p>${post.content}</p>
        <button id="edit-btn">Edit</button>
        <button id="delete-btn">Delete</button>
      `;

      document.getElementById("edit-btn").addEventListener("click", () => showEditForm(post));
      document.getElementById("delete-btn").addEventListener("click", () => deletePost(post.id));
    })
    .catch((err) => console.error("Error loading post details:", err));
}

// Add new post
function addNewPostListener() {
  const form = document.getElementById("new-post-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("new-title").value;
    const author = document.getElementById("new-author").value;
    const image = document.getElementById("new-image").value;
    const content = document.getElementById("new-content").value;

    const newPost = { title, author, image, content, date: new Date().toISOString().split("T")[0] };

    fetch(baseURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost),
    })
      .then((res) => res.json())
      .then((savedPost) => {
        form.reset();
        displayPosts(); // refresh post list
        handlePostClick(savedPost.id); // show the new post
      })
      .catch((err) => console.error("Error adding post:", err));
  });
}

// Edit post
function showEditForm(post) {
  const form = document.getElementById("edit-post-form");
  form.classList.remove("hidden");

  document.getElementById("edit-title").value = post.title;
  document.getElementById("edit-content").value = post.content;
}

// Handle edit form submission
function addEditPostListener() {
  const form = document.getElementById("edit-post-form");
  const cancel = document.getElementById("cancel-edit");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("edit-title").value;
    const content = document.getElementById("edit-content").value;

    fetch(`${baseURL}/${currentPostId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    })
      .then((res) => res.json())
      .then((updatedPost) => {
        form.classList.add("hidden");
        displayPosts();
        handlePostClick(updatedPost.id);
      })
      .catch((err) => console.error("Error updating post:", err));
  });

  cancel.addEventListener("click", () => {
    form.classList.add("hidden");
  });
}

// Delete post
function deletePost(postId) {
  fetch(`${baseURL}/${postId}`, { method: "DELETE" })
    .then(() => {
      displayPosts();
      document.getElementById("post-detail").innerHTML = "";
      document.getElementById("edit-post-form").classList.add("hidden");
    })
    .catch((err) => console.error("Error deleting post:", err));
}

function main() {
  displayPosts();
  addNewPostListener();
  addEditPostListener();
}

document.addEventListener("DOMContentLoaded", main);
