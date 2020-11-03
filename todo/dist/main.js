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
    // let projectNames = Object.keys(projects);

    for (let [projectName, items] of projectList) {
        let itemBlock = document.createElement('ul');

        //create item block
        for (let item of items) {
            let itemLine = document.createElement('li');
            itemLine.setAttribute('js-item-id', items.indexOf(item));
            item['completed'] ? itemLine.classList.add('completed') : itemLine.classList.remove('completed');

            itemLine.append(item['description']);
            itemLine.innerHTML += '<button class="js-delete-item">x</button>';
            itemBlock.append(itemLine);
        }

        //add input
        let inputLine = document.createElement('li');
        inputLine.innerHTML = '<input></input>';
        itemBlock.append(inputLine);

        //create and populate projects
        let projectTemplate = `
        <div class="todo-wrapper" js-project-id="${projectName}">
          <h3>${projectName}<button class="delete-project">X</button></h3>
          ${itemBlock.outerHTML}
        <button class="js-add-item">add</button>
        </div>`;

        content.insertAdjacentHTML('beforeend', projectTemplate);
    }

    content.insertAdjacentHTML('beforeend', `<div class="break"></div><button class="add-project">New Project</button>`);

    addEvents();
}

addProjects();

//get values

function getInputValue(evt) {
    let inputValue = evt.target.closest('div[js-project-id]').querySelector('input').value;
    return inputValue;
}

function getProjectId(evt) {
    let projectId = evt.target.closest('div[js-project-id]').getAttribute('js-project-id');
    return projectId;
}

function getItemId(evt) {
    let itemId = evt.target.closest('[js-item-id]').getAttribute('js-item-id');
    return itemId;
}

//add project to projects

function addProject() {
    let projectName = prompt('Project Name?');
    projects[projectName] = [];
    addProjects();
}

//add item to project

function putInputValue(evt) {
    let description = getInputValue(evt);
    let projectId = getProjectId(evt);
    let completed = 0;
    projects[projectId].push({ description, completed });
    addProjects();
}

// delete project

function deleteProject(evt) {
    let projectId = getProjectId(evt);
    delete projects[projectId];
    addProjects();
}

function deleteItem(evt) {
    let projectId = getProjectId(evt);
    let itemId = getItemId(evt);
    console.log(projects[projectId][itemId]);
    projects[projectId].splice(itemId, 1);
    evt.stopPropagation();

    addProjects();
}
//toogle completed

function toggleCompleted(evt) {
    let projectId = getProjectId(evt);
    let itemId = getItemId(evt);
    let completedStatus = projects[projectId][itemId]['completed'];
    completedStatus ? (projects[projectId][itemId]['completed'] = 0) : (projects[projectId][itemId]['completed'] = 1);
    // evt.stopPropagation();

    addProjects();
}

//events

function addEvents() {
    //add project
    let addNewProject = document.querySelector('.add-project');
    addNewProject.addEventListener('click', addProject);

    //add to projects

    let addButtons = document.querySelectorAll('.js-add-item');
    addButtons.forEach((x) => x.addEventListener('click', putInputValue));

    //delete project
    let deleteCurrentProject = document.querySelectorAll('.delete-project');
    deleteCurrentProject.forEach((x) => x.addEventListener('click', deleteProject));

    //delete item
    let deleteCurrentItem = document.querySelectorAll('.js-delete-item');
    deleteCurrentItem.forEach((x) => x.addEventListener('click', deleteItem));

    //strike out

    function strikeItem() {
        this.classList.toggle('completed');
    }

    let listItems = document.querySelectorAll('.todo-wrapper > ul > li');
    listItems.forEach((x) => x.addEventListener('click', toggleCompleted));
}
