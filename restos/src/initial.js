let pageContent = document.querySelector('#content');

function initialPage() {
    let mainImg = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Wide_angle_tetons.jpg/1280px-Wide_angle_tetons.jpg';
    let pageTitle = 'Mamma Mia Lemmego';
    let introParagraph = 'Welcome to the best restaurant experience this side of the styx !';

    const pageStructure = `<img src="${mainImg}" alt="">
<h1>${pageTitle}</h1>
<p>${introParagraph}</p>
`;
    pageContent.innerHTML = pageStructure;
}

export { initialPage };
