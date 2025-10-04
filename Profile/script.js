document.addEventListener('DOMContentLoaded', function() {
    // Profile Picture Upload
    const profilePicInput = document.getElementById('profilePicInput');
    const profilePictureImg = document.getElementById('profilePictureImg');
    const editProfilePicBtn = document.getElementById('editProfilePicBtn');
    
    editProfilePicBtn.addEventListener('click', function() {
        profilePicInput.click();
    });
    
    profilePicInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                profilePictureImg.src = event.target.result;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // Cover Photo Upload
    const coverPhotoInput = document.getElementById('coverPhotoInput');
    const coverPhotoImg = document.getElementById('coverPhotoImg');
    const editCoverBtn = document.getElementById('editCoverBtn');
    
    editCoverBtn.addEventListener('click', function() {
        coverPhotoInput.click();
    });
    
    coverPhotoInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                coverPhotoImg.src = event.target.result;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // Inline Editing for Profile Info
    const profileName = document.getElementById('profileName');
    const profileBio = document.getElementById('profileBio');
    const infoValues = document.querySelectorAll('.info-value');
    
    // Save content when focus is lost
    function saveContent(element) {
        if (element.textContent.trim() === '') {
            element.textContent = element.dataset.default || 'Not specified';
        }
    }
    
    profileName.addEventListener('blur', function() {
        saveContent(this);
    });
    
    profileBio.addEventListener('blur', function() {
        saveContent(this);
    });
    
    infoValues.forEach(item => {
        item.dataset.default = item.textContent;
        
        item.addEventListener('blur', function() {
            saveContent(this);
        });
    });
    
    // Like Button Functionality
    document.querySelectorAll('.post-action').forEach(button => {
        if (button.textContent.includes('Like')) {
            button.addEventListener('click', function() {
                const icon = this.querySelector('i');
                if (icon.classList.contains('far')) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    icon.style.color = 'var(--primary-color)';
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    icon.style.color = '';
                }
            });
        }
    });
    
    // Create Story Button
    document.querySelector('.create-story').addEventListener('click', function() {
        alert('Story creation functionality would open here');
    });
    
    // Create Post Button
    document.querySelector('.post-option:nth-child(2)').addEventListener('click', function() {
        alert('Image upload for post would open here');
    });
});