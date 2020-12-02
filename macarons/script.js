const macaron = 'https://d3i3cp443mmogz.cloudfront.net/public/home-sowefund/derniers-jours-pour-investir.png';

//page startup

document.querySelectorAll('.vignette.last-days').forEach((x) => {
    let macContainer = document.createElement('div');
    macContainer.innerHTML = '';
    macContainer.innerHTML = `<img src="${macaron}" height = "80" width = "80" class="macaron-last-days" style="position : absolute; width : 35%; min-width : 80px; top : 0px; pointer-events : none;">`;
    x.append(macContainer);
});

//pages projets

const macContainer = document.createElement('div');
macContainer.innerHTML = `<img src="${macaron}" height = "120" width = "120" class="macaron-last-days" style="position : absolute; width : 14%; top : 0px;  left : 0px;">`;
document.querySelector('.last-days > .box-block').append(macContainer);
