let dropdown = document.querySelectorAll('.menu-item');
dropdown.forEach((x) => x.addEventListener('mouseenter', reveal));
dropdown.forEach((x) => x.addEventListener('mouseleave', reveal));

function reveal(evt) {
    console.log(evt);
    let ul = evt.target.querySelector('ul');
    ul.classList.toggle('hidden');
}
