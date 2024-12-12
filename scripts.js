const proxyUrl = 'https://api.allorigins.win/get?url=';
const targetUrl = 'https://www.scharnstein.net/gallery/';

async function fetchGalleryImagesMetaData() {
    try {
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        let parser = new DOMParser();
        let doc = parser.parseFromString(data.contents, 'text/html');

        const imgLinks = [];
        const regex = /<a href="([^"]+(?<!_thumb)\.(jpg|jpeg|png|gif))">[^<]+<\/a><\/td>\s*<td align="right">([^<]+)<\/td>/gi;
        let match;

        while ((match = regex.exec(data.contents)) !== null) {
            const imgSrc = new URL(match[1], targetUrl).href;
            const lastModified = new Date(match[3].trim().replace(/-/g, '/')); // Replace '-' with '/' for better parsing
            imgLinks.push({ imgSrc, lastModified });
        }
        console.log('Image metadata extracted from gallery:', imgLinks.length);
        return imgLinks;
    } catch (error) {
        console.error('Error fetching images:', error);
        return [];
    }
}

function fetchImages() {
    console.log('Fetching images...');
    const startTime = performance.now();
    fetch(proxyUrl + encodeURIComponent(targetUrl + 'gallery.html'))
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

            // Fetch all links that contain images and exclude slideshow.gif
            let imgLinks = Array.from(doc.querySelectorAll('a img'))
                .map(img => {
                    let imgSrc = new URL(img.getAttribute('src').replace('_thumb', ''), targetUrl).href;
                    // Ensure the protocol is HTTPS
                    imgSrc = imgSrc.replace(/^http:\/\//i, 'https://');
                    return { imgSrc };
                })
                .filter(link => !['slideshow.gif', 'titelbild27_4_2020.jpg', 'fsin11_18.jpg'].some(exclude => link.imgSrc.includes(exclude)));

            // Fetch metadata and merge with imgLinks
            fetchGalleryImagesMetaData().then(metadata => {
                imgLinks = imgLinks.map(link => {
                    const meta = metadata.find(meta => meta.imgSrc === link.imgSrc);
                    return { ...link, lastModified: meta ? meta.lastModified : new Date(0) };
                });

                // Sort images by lastModified date
                imgLinks.sort((a, b) => b.lastModified - a.lastModified);

                console.log('Image sources and modified dates extracted:', performance.now() - startTime, 'ms');
                console.log('Number of images:', imgLinks.length);

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
                    img.className = 'gallery-img';
                    a.appendChild(img);
                    div.appendChild(a);

                    // Create and append the date element
                    const dateDiv = document.createElement('div');
                    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
                    dateDiv.textContent = link.lastModified.toLocaleDateString('de-DE', options);
                    div.appendChild(dateDiv);

                    gallery.appendChild(div);

                    // Apply "seen" state if stored in local storage
                    if (localStorage.getItem(link.imgSrc) === 'seen') {
                        img.classList.add('seen');
                    }

                    // Add click event listener to toggle "seen" state
                    img.addEventListener('click', (event) => {
                        event.preventDefault();
                        if (img.classList.contains('seen')) {
                            img.classList.remove('seen');
                            localStorage.removeItem(link.imgSrc);
                        } else {
                            img.classList.add('seen');
                            localStorage.setItem(link.imgSrc, 'seen');
                        }
                    });

                    img.addEventListener('dblclick', (event) => {
                        event.preventDefault();
                        Fancybox.show([{ src: link.imgSrc, type: 'image' }]);
                    });

                });
            });
        })
        .catch(error => {
            console.error('Error fetching images:', error);
        });
}

fetchImages();
