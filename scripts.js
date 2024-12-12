function fetchImages() {
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const targetUrl = 'http://www.scharnstein.net/gallery/gallery.html';
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
            let imgLinks = Array.from(doc.querySelectorAll('a'))
                .filter(a => a.querySelector('img') && a.getAttribute('href').endsWith('.html'))
                .map(a => ({
                    imgSrc: new URL(a.querySelector('img').getAttribute('src').replace('_thumb', ''), targetUrl).href,
                    linkHref: new URL(a.getAttribute('href'), targetUrl).href
                }))
                .filter(link => !link.imgSrc.includes('slideshow.gif'))
                .filter(link => !link.imgSrc.includes('titelbild27_4_2020.jpg'))
                .filter(link => !link.imgSrc.includes('fsin11_18.jpg'));

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