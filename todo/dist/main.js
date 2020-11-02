//Logic shit

let projects = {
    'PROJECT ZERO': [
        {
            description: 'Finir le circuit',
            dueDate: '12/12/2020',
            priority: 3,
            completed: 0,
        },
        {
            description: 'Do better',
            dueDate: '12/12/2022',
            priority: 1,
            completed: 0,
        },
    ],
    'PROJECT ONO': [
        {
            description: 'New shit coming',
            dueDate: '12/12/2020',
            priority: 2,
            completed: 1,
        },
        {
            description: 'Tell yo friends',
            dueDate: '12/12/2122',
            priority: 0,
            completed: 0,
        },
    ],
};

//DOM shit

//add projects

function addProjects() {
    let content = document.querySelector('#content');
    content.innerHTML = '';

    let projectList = Object.entries(projects);
    let projectNames = Object.keys(projects);

    for (let [projectName, items] of projectList) {
        let itemBlock = document.createElement('ul');

        //create item block
        for (let item of items) {
            let itemLine = document.createElement('li');

            itemLine.append(item['description']);
            itemBlock.append(itemLine);
        }

        console.log({ projectName });
        console.log(projectNames.indexOf(projectName));

        //add input
        itemBlock.append(document.createElement('input'));

        //create and populate projects
        let projectTemplate = `
        <div class="todo-wrapper" js-project-id=${projectNames.indexOf(projectName)}>
          <h3>${projectName}</h3>
          ${itemBlock.outerHTML}
        <button class="js-add-item">add</button>
        </div>`;

        content.insertAdjacentHTML('beforeend', projectTemplate);
    }

    addEvents();
}

addProjects();

//find current project number
function currentProjectId() {
    let currentElement = this;
    let currentProject = currentElement.closest('div[js-project-id]');
    console.log(currentProject.getAttribute('js-project-id'));
    return currentProject.getAttribute('js-project-id');
}
function inputToProjects() {
    let projectId = currentProjectId();
    let currentProject = document.querySelector(`div[js-project-id=${projectId}]`);
    console.log(currentProject);
}

//events

function addEvents() {
    //add to projects

    let addButtons = document.querySelectorAll('.js-add-item');
    addButtons.forEach((x) => x.addEventListener('click', currentProjectId));

    //strike out

    function strikeItem() {
        this.classList.toggle('completed');
    }

    let listItems = document.querySelectorAll('.todo-wrapper > ul > li');
    listItems.forEach((x) => x.addEventListener('click', strikeItem));

    //input

    function createItem() {}
}
