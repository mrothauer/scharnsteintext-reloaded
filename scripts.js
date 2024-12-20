function fetchImages() {
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const targetUrl = 'https://www.scharnstein.net/gallery/gallery.html';
    console.log('Fetching images...');
    const startTime = performance.now();
    fetch(proxyUrl + encodeURIComponent(targetUrl))
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            console.log('Response received:', performance.now() - startTime, 'ms');
            return response.json();
        })
        .then(data => {
            console.log('Data received:', performance.now() - startTime, 'ms');
            let parser = new DOMParser();
            let doc = parser.parseFromString(data.contents, 'text/html');

            // fetch all links that contain images and exclude slideshow.gif
            let imgLinks = Array.from(doc.querySelectorAll('a img'))
                .map(img => {
                    let imgSrc = new URL(img.getAttribute('src').replace('_thumb', ''), targetUrl).href;
                    // Ensure the protocol is HTTPS
                    imgSrc = imgSrc.replace(/^http:\/\//i, 'https://');
                    return { imgSrc };
                })
                .filter(link => !['slideshow.gif', 'titelbild27_4_2020.jpg', 'fsin11_18.jpg'].some(exclude => link.imgSrc.includes(exclude)));

            console.log('Image sources extracted:', performance.now() - startTime, 'ms');

            // Add images to the grid
            const gallery = document.getElementById('gallery');
            imgLinks.forEach(link => {
                const div = document.createElement('div');
                div.className = 'grid-item';
                const a = document.createElement('a');
                a.href = link.imgSrc;
                a.setAttribute('data-gallery', 'gallery');
                const img = document.createElement('img');
                img.src = link.imgSrc;
                a.appendChild(img);
                div.appendChild(a);
                gallery.appendChild(div);
            });

            // Initialize GLightbox with no animation
            const lightbox = GLightbox({
                selector: 'a[data-gallery="gallery"]',
                openEffect: 'none',
                closeEffect: 'none'
            });
        })
        .catch(error => {
            console.error('Error fetching images:', error);
        });
}

fetchImages();