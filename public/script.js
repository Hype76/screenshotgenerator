document.getElementById('screenshotForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const urlInput = document.getElementById('url').value.trim();
    const button = e.target.querySelector('button');
    const resultDiv = document.getElementById('result');
    
    if (!urlInput) {
        alert('Please enter a URL');
        return;
    }

    try {
        button.textContent = 'Capturing...';
        button.disabled = true;
        resultDiv.innerHTML = '<div class="text-center">Loading...</div>';

        console.log('Making request to:', `/api/screenshot?url=${encodeURIComponent(urlInput)}`);
        const response = await fetch(`/api/screenshot?url=${encodeURIComponent(urlInput)}`);
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        console.log('Image data length:', data.image?.length);

        if (!data.image) {
            throw new Error('No image data received');
        }

        if (data.error) {
            throw new Error(data.error);
        }

        console.log('Creating image element...');
        
        // Create image element
        const container = document.createElement('div');
        container.className = 'bg-white p-4 rounded-lg shadow-lg';
        
        const img = document.createElement('img');
        img.src = `data:image/png;base64,${data.image}`;
        img.alt = `Screenshot of ${urlInput}`;
        img.className = 'w-full rounded-lg';
        
        // Add event listeners
        img.addEventListener('load', () => console.log('Image loaded successfully'));
        img.addEventListener('error', (e) => console.error('Image failed to load:', e));
        
        container.appendChild(img);
        resultDiv.innerHTML = '';
        resultDiv.appendChild(container);

    } catch (error) {
        console.error('Error details:', error);
        resultDiv.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                ${error.message || 'Failed to capture screenshot'}
            </div>
        `;
    } finally {
        button.textContent = 'Capture Screenshot';
        button.disabled = false;
    }
}); 