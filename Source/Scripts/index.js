// =========================================================================
const FILE_PATH = 'Source/Files/';
const fileList = [
    'no.txt',
    'yes.txt'
];
// =========================================================================

const dropdownMenu = document.getElementById('file-dropdown-menu');
const dropdownButton = document.getElementById('dropdownMenuButton');
const cardTitle = document.getElementById('card-title');
const itemCountSpan = document.getElementById('item-count');
const listItemsContainer = document.getElementById('list-items-container');
const card = document.getElementById('content-card');

/**
 * Fetches a file and populates the card content.
 * @param {string} filename - The name of the file to fetch.
 * @param {string} displayName - The name to display in the dropdown.
 */
async function loadFileContent(filename) {
    const url = FILE_PATH + filename;
    dropdownButton.textContent = `Loading ${filename}...`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const textContent = await response.text();

        // Split the content into lines
        const lines = textContent.split(/\r?\n/);

        const title = lines[0] || filename;
        const contentArray = lines.slice(2).filter(item => item.trim() !== ''); // Splice out title (0) and empty line (1), and remove any remaining empty lines

        // --- UI Update Logic ---
        dropdownButton.textContent = title;
        cardTitle.innerHTML = title;

        const itemCount = contentArray.length;
        itemCountSpan.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;

        listItemsContainer.innerHTML = ''; // Clear previous list

        contentArray.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item-minimal';
            li.innerHTML = `
                        <div class="d-flex align-items-center">
                            <span class="text-muted fw-bold me-2">${index + 1}.</span>
                            <span class="item-text">${item}</span>
                        </div>
                        <button class="btn btn-sm btn-light p-1 copy-item-btn" data-item-text="${item.replace(/"/g, '&quot;')}" title="Copy Item">
                            <i class="ph ph-copy-simple"></i>
                        </button>
                    `;
            listItemsContainer.appendChild(li);
        });

        // Attach individual copy button listeners
        document.querySelectorAll('.copy-item-btn').forEach(button => {
            button.onclick = (e) => copyToClipboard(e.currentTarget.dataset.item - text, 'Item copied!');
        });

        card.dataset.currentContent = contentArray.join('\n'); // Store content for global copy

    } catch (error) {
        renderBlankCard(`Error loading file: ${filename}. Check console for details.`, true);
        console.error('Fetch error:', error);
    }
}

/**
 * Populates the dropdown menu using the first line of each file as the display name.
 */
function initializeDropdown() {
    renderBlankCard();

    fileList.forEach(filename => {
        const url = FILE_PATH + filename;

        // Use fetch to get ONLY the title (first line)
        fetch(url)
            .then(response => {
                if (!response.ok) return `${filename} (Error)`;
                return response.text();
            })
            .then(textContent => {
                const title = textContent.split(/\r?\n/)[0] || filename; // Use first line or filename if empty

                const li = document.createElement('li');
                const a = document.createElement('a');
                a.className = 'dropdown-item';
                a.href = '#';
                a.textContent = title;
                a.onclick = () => loadFileContent(filename);

                dropdownMenu.appendChild(li).appendChild(a);
            })
            .catch(() => {
                // If fetching title fails, just use filename
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.className = 'dropdown-item text-danger';
                a.href = '#';
                a.textContent = `${filename} (Load Failed)`;
                dropdownMenu.appendChild(li).appendChild(a);
            });
    });
}

/**
 * Renders the card in its initial blank state.
 */
function renderBlankCard(message = 'No file content loaded.', isError = false) {
    dropdownButton.textContent = 'Select a File';
    cardTitle.innerHTML = isError ? `<span class="text-danger">Error / Note</span>` : 'Welcome';
    itemCountSpan.textContent = '0 items';
    listItemsContainer.innerHTML = `
                <li class="list-group-item-minimal text-muted fst-italic">
                    ${message}
                </li>
            `;
    card.dataset.currentContent = '';
}

/**
 * Global function to copy all list items (called by top copy buttons).
 * @param {string} format - 'newline' or 'comma'.
 */
function copyList(format) {
    const content = card.dataset.currentContent;
    if (!content) {
        copyToClipboard('', 'No content to copy!', true);
        return;
    }

    const listItems = content.split('\n');
    let textToCopy;

    if (format === 'comma') {
        textToCopy = listItems.join(', ');
    } else { // 'newline'
        textToCopy = listItems.join('\n');
    }

    copyToClipboard(textToCopy, `List copied (${format} format)!`);
}

/**
 * Utility function to copy text to clipboard and show a temporary message.
 * @param {string} text - The text to copy.
 * @param {string} message - The message to show in the dropdown button.
 * @param {boolean} isError - If true, treats the message as an error/note.
 */
function copyToClipboard(text, message, isError = false) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = dropdownButton.textContent;
        const originalClasses = dropdownButton.className;

        // Temporarily change button text and style for feedback
        dropdownButton.textContent = message;
        dropdownButton.className = `btn ${isError ? 'btn-danger' : 'btn-success'} dropdown-toggle w-100`;

        setTimeout(() => {
            dropdownButton.textContent = originalText;
            dropdownButton.className = originalClasses;
        }, 1500); // Revert after 1.5 seconds

    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
}

// Initialize the app when the script loads
initializeDropdown();