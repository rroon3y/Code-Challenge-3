const baseURL = "http://localhost:3000/posts";

let currentPostId = null;  // track which post is currently shown/edited

// function will fetch all posts and display titles
function displayPosts() {
   fetch(baseURL)
   .then(response => response.json())
   .then(posts => {
    const postList = document.getElementById("post-list");

    // clear any existing posts
    postList.innerHTML = "<h2>All Posts</h2>";

    posts.forEach(post => {
        const postItem = document.createElement("div");
        postItem.textContent = post.title;
        postItem.style.cursor = "pointer";
        postItem.style.padding = "5px";
        postItem.style.borderBottom = "1px solid #ccc";

        // add click event to show post details 
        postItem.addEventListener("click", () => handlePostClick(post.id));

        postList.appendChild(postItem);
    });

    // show first post by default
    if (posts.length > 0){
        handlePostClick(posts[0].id);
    }
   })
   .catch(error => console.error("Error fetching posts:", error));
}

// function will display a post's full info
function handlePostClick(postId) {
    currentPostId = postId;  // set current post

    fetch(`${baseURL}/${postId}`)
    .then(response => response.json())
    .then(post => {
        const detail = document.getElementById("post-detail");
        detail.innerHTML = `
        <h2>${post.title}</h2>
        <p>${post.content}</p>
        <p><strong>Author:</strong> ${post.author}</p>
        <button id="edit-btn">Edit</button>
        <button id="delete-btn">Delete</button>
        `;

        // Attach event listeners to Edit and Delete buttons
        document.getElementById("edit-btn").addEventListener("click", () => showEditForm(post));
        document.getElementById("delete-btn").addEventListener("click", () => deletePost(post.id));
    })
    .catch(error => console.error("Error loading post detail:", error));
}

// function add a new post (now with POST request to backend)
function addNewPostListener() {
    const form = document.getElementById("new-post-form");

    form.addEventListener("submit", event => {
        event.preventDefault();

        // get form values
        const title = document.getElementById("new-title").value;
        const content = document.getElementById("new-content").value;
        const author = document.getElementById("new-author").value;

        // create a new post
        const newPost = {
            title,
            content,
            author
        };

        // send POST request to save post to backend
        fetch(baseURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newPost)
        })
        .then(response => response.json())
        .then(savedPost => {
            // add new post visually to #post-list
            const postList = document.getElementById("post-list");

            const postItem = document.createElement("div");
            postItem.textContent = savedPost.title;
            postItem.style.cursor = "pointer";
            postItem.style.padding = "5px";
            postItem.style.borderBottom = "1px solid #ccc";

            // attach click event
            postItem.addEventListener("click", () => handlePostClick(savedPost.id));
            postList.appendChild(postItem);

            // clear the form
            form.reset();
        })
        .catch(error => console.error("Error saving post:", error));
    });
}

// show edit form and populate with post data
function showEditForm(post) {
    const editForm = document.getElementById("edit-post-form");
    editForm.classList.remove("hidden");

    document.getElementById("edit-title").value = post.title;
    document.getElementById("edit-content").value = post.content;
}

// listen for edit form submission and send PATCH request
function addEditPostListener() {
    const editForm = document.getElementById("edit-post-form");
    const cancelBtn = document.getElementById("cancel-edit");

    editForm.addEventListener("submit", event => {
        event.preventDefault();

        const updatedTitle = document.getElementById("edit-title").value;
        const updatedContent = document.getElementById("edit-content").value;

        // send PATCH request
        fetch(`${baseURL}/${currentPostId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: updatedTitle,
                content: updatedContent
            })
        })
        .then(response => response.json())
        .then(updatedPost => {
            // hide edit form
            editForm.classList.add("hidden");

            // update detail view with new info
            handlePostClick(updatedPost.id);

            // update post title in the list
            updatePostTitleInList(updatedPost);
        })
        .catch(error => console.error("Error updating post:", error));
    });

    cancelBtn.addEventListener("click", () => {
        editForm.classList.add("hidden");
    });
}

// helper to refresh post list after update or deletion
function updatePostTitleInList(updatedPost) {
    // For simplicity, just reload all posts to reflect the change
    displayPosts();
}

// delete post by id and update UI
function deletePost(postId) {
    fetch(`${baseURL}/${postId}`, {
        method: "DELETE"
    })
    .then(() => {
        // reload posts after deletion
        displayPosts();

        // clear post detail view
        const detail = document.getElementById("post-detail");
        detail.innerHTML = "<p>Select a post to see details.</p>";

        // hide edit form if open
        document.getElementById("edit-post-form").classList.add("hidden");
    })
    .catch(error => console.error("Error deleting post:", error));
}

// runs once DOM is fully loaded
function main() {
    displayPosts();
    addNewPostListener();
    addEditPostListener();
}

document.addEventListener("DOMContentLoaded", main);
