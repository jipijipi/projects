let pageContent = document.querySelector('#content');

function tabMaker() {
    let nav = document.createElement('nav');
    pageContent.append(nav);

    let tabContents = {
        presentation: 'meu oui mosieur',
        menu: 'this and that and this and that',
        contact: '12 rue de la poigne',
    };

    for (let key in tabContents) {
        console.log(key);
        let link = `<a href="#" class="tab" js-item="${key}">${key}</a>`;
        nav.insertAdjacentHTML('beforeend', link);
    }

    const contentArea = document.createElement('div');
    contentArea.setAttribute('id', 'contentArea');
    pageContent.append(contentArea);

    function tabChange(elem) {
        tabLinks.forEach((x) => x.classList.remove('active'));
        elem.classList.add('active');
        let tabName = elem.getAttribute('js-item');
        contentArea.innerHTML = tabContents[tabName];
    }

    let tabLinks = document.querySelectorAll('a');

    tabLinks.forEach((x) => x.addEventListener('click', () => tabChange(x)));
}

export { tabMaker };
