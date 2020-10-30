console.log('fack');

import { initialPage } from './initial';

initialPage();

let tab1 = 'presentation';
let tab2 = 'menu';
let tab3 = 'contact';

let tabs = `
  <a href="#1" id="tab1">${tab1}</a>
  <a href="#2" id="tab2">${tab2}</a>
  <a href="#3" id="tab3">${tab3}</a>
`;

const pageContent = document.querySelector('#content');
pageContent.insertAdjacentHTML('beforeend', tabs);
