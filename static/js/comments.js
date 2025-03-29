// comments.js - Collaborative workspace with commenting system

class CommentSystem {
    constructor() {
        this.initializeCommentSystem();
        this.bindEvents();
    }

    initializeCommentSystem() {
        // Add comment sections to report cards
        document.querySelectorAll('.report-card').forEach(card => {
            if (!card.querySelector('.comment-section')) {
                const reportId = card.dataset.reportId;
                const commentSection = this.createCommentSection(reportId);
                card.appendChild(commentSection);
            }
        });
    }

    createCommentSection(reportId) {
        const section = document.createElement('div');
        section.className = 'comment-section p-4 border-t mt-4';
        section.innerHTML = `
            <h4 class="text-lg font-semibold mb-2">Comments</h4>
            <div class="comments-container mb-4" id="comments-${reportId}"></div>
            <form class="comment-form flex gap-2" data-report-id="${reportId}">
                <input type="text" 
                       class="flex-1 px-3 py-2 border rounded-md" 
                       placeholder="Add a comment..."
                       required>
                <button type="submit" 
                        class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                    Send
                </button>
            </form>
        `;
        this.loadComments(reportId);
        return section;
    }

    bindEvents() {
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('comment-form')) {
                e.preventDefault();
                const reportId = e.target.dataset.reportId;
                const input = e.target.querySelector('input');
                this.submitComment(reportId, input.value);
                input.value = '';
            }
        });
    }

    loadComments(reportId) {
        fetch(`/api/reports/${reportId}/comments`)
            .then(response => response.json())
            .then(comments => {
                const container = document.getElementById(`comments-${reportId}`);
                container.innerHTML = comments.map(comment => this.createCommentElement(comment)).join('');
            })
            .catch(error => console.error('Error loading comments:', error));
    }

    createCommentElement(comment) {
        return `
            <div class="comment bg-gray-50 p-3 rounded-md mb-2">
                <div class="flex justify-between items-start">
                    <span class="font-medium">${comment.author}</span>
                    <span class="text-sm text-gray-500">${this.formatDate(comment.created_at)}</span>
                </div>
                <p class="mt-1 text-gray-700">${comment.content}</p>
            </div>
        `;
    }

    submitComment(reportId, content) {
        fetch(`/api/reports/${reportId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content })
        })
        .then(response => response.json())
        .then(comment => {
            const container = document.getElementById(`comments-${reportId}`);
            container.insertAdjacentHTML('beforeend', this.createCommentElement(comment));
            // Notify other users about the new comment
            window.notificationSystem.showNotification(
                `New comment on Report #${reportId}`,
                'info'
            );
        })
        .catch(error => console.error('Error submitting comment:', error));
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
    }
}

// Initialize comment system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.commentSystem = new CommentSystem();
});