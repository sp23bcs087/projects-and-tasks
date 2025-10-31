$(document).ready(function() {
    const apiUrl = 'https://jsonplaceholder.typicode.com/posts';
    const postTable = $('#post-table');
    const postForm = $('#post-form');
    const loader = $('#loader');

    function fetchPosts() {
        loader.show();
        postTable.hide();

        $.ajax({
            url: apiUrl,
            method: 'GET',
            success: function(posts) {
                postTable.find('tbody').empty();
                
                const postsToShow = posts.slice(0, 10);

                postsToShow.forEach(function(post) {
                    postTable.find('tbody').append(`
                        <tr data-post-id="${post.id}">
                            <td>${post.title}</td>
                            <td>${post.body}</td>
                            <td class="text-end">
                                <button class="btn btn-sm btn-info btn-edit" data-id="${post.id}"><i class="fas fa-edit"></i> Edit</button>
                                <button class="btn btn-sm btn-danger btn-delete" data-id="${post.id}"><i class="fas fa-trash"></i> Delete</button>
                            </td>
                        </tr>
                    `);
                });
                loader.hide();
                postTable.show();
            },
            error: function() {
                loader.hide();
                alert('Error fetching posts. Please try again.');
            }
        });
    }

    postForm.on('submit', function(event) {
        event.preventDefault();

        const postId = $('#post-id').val();
        const postTitle = $('#title').val().trim();
        const postBody = $('#body').val().trim();
        
        if (!postTitle || !postBody) {
            alert('Title and Content cannot be empty.');
            return;
        }

        const postData = { title: postTitle, body: postBody, userId: 1 };
        const isUpdate = postId !== '';
        const method = isUpdate ? 'PUT' : 'POST';
        const url = isUpdate ? `${apiUrl}/${postId}` : apiUrl;

        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(postData),
            success: function(newPost) {
                if (isUpdate) {
                    alert('Post updated successfully!');
                    const row = $(`tr[data-post-id="${postId}"]`);
                    row.find('td:nth-child(1)').text(newPost.title);
                    row.find('td:nth-child(2)').text(newPost.body);
                } else {
                    alert('Post created successfully!');
                    const newRow = `
                        <tr data-post-id="${newPost.id}" style="display: none;">
                            <td>${newPost.title}</td>
                            <td>${newPost.body}</td>
                            <td class="text-end">
                                <button class="btn btn-sm btn-info btn-edit" data-id="${newPost.id}"><i class="fas fa-edit"></i> Edit</button>
                                <button class="btn btn-sm btn-danger btn-delete" data-id="${newPost.id}"><i class="fas fa-trash"></i> Delete</button>
                            </td>
                        </tr>
                    `;
                    postTable.find('tbody').prepend(newRow);
                    $(`tr[data-post-id="${newPost.id}"]`).fadeIn(500);
                }
                resetForm();
            },
            error: function() {
                alert('An error occurred. Please try again.');
            }
        });
    });

    postTable.on('click', '.btn-edit', function() {
        const postId = $(this).data('id');
        
        $.ajax({
            url: `${apiUrl}/${postId}`,
            method: 'GET',
            success: function(post) {
                $('#post-id').val(post.id);
                $('#title').val(post.title);
                $('#body').val(post.body);
                $('#form-title').text('Edit Post');
                $('#cancel-edit').removeClass('d-none');
                $('html, body').animate({ scrollTop: postForm.offset().top - 20 }, 500);
            },
            error: function() {
                alert('Could not fetch post details.');
            }
        });
    });

    postTable.on('click', '.btn-delete', function() {
        const postId = $(this).data('id');

        if (confirm('Are you sure you want to delete this post?')) {
            $.ajax({
                url: `${apiUrl}/${postId}`,
                method: 'DELETE',
                success: function() {
                    alert('Post deleted successfully!');
                    $(`tr[data-post-id="${postId}"]`).fadeOut(500, function() {
                        $(this).remove();
                    });
                },
                error: function() {
                    alert('Error deleting post.');
                }
            });
        }
    });

    $('#cancel-edit').on('click', function() {
        resetForm();
    });

    function resetForm() {
        $('#post-id').val('');
        postForm[0].reset();
        $('#form-title').text('Add a New Post');
        $('#cancel-edit').addClass('d-none');
    }

    fetchPosts();
});
