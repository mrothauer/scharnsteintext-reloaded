const init = () => {
    const targetUrl = new URL(window.location.href);
    const imgLinks = Array.from(document.querySelectorAll('a img'))
        .map(img => {
            let imgSrc = new URL(img.getAttribute('src').replace('_thumb', ''), targetUrl).href;
            return { imgSrc };
        })
        .filter(link => !['slideshow.gif'].some(
            exclude => link.imgSrc.includes(exclude))
        );

    const gallery = document.createElement('div');
    gallery.id = 'gallery';
    gallery.className = 'grid-container';

    imgLinks.forEach(link => {

        const div = document.createElement('div');
        div.className = 'grid-item';
        const a = document.createElement('a');
        a.href = link.imgSrc;
        a.setAttribute('data-gallery', 'gallery');
        const img = document.createElement('img');
        img.src = link.imgSrc;

        img.addEventListener('click', (event) => {
            event.preventDefault();
            if (!isMobile()) {
                Fancybox.show([{ src: link.imgSrc, type: 'image' }]);
            }
        });

        a.appendChild(img);
        div.appendChild(a);
        gallery.appendChild(div);

    });

    document.body.appendChild(gallery);

};

const isMobile = () => {
    return window.innerWidth <= 800;
}

init();