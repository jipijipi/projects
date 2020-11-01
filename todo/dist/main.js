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

function createItem(description, dueDate, priority) {
    return { description, dueDate, priority };
}

function addItem() {
    let description = prompt('description');
    let dueDate = prompt('Date de fin');
    let priority = prompt('prio? (0 à 3)');

    this.push(createItem(description, dueDate, priority));
}

//DOM shit

//add projects

function addProjects() {
    let content = document.querySelector('#content');
    content.innerHTML = '';

    let projectList = Object.entries(projects);

    for (let [projectName, items] of projectList) {
        let itemBlock = document.createElement('ul');

        //create item block
        for (let item of items) {
            console.log(item, item['description']);
            let itemLine = document.createElement('li');

            itemLine.append(item['description']);
            console.log(itemLine);
            itemBlock.append(itemLine);
            console.log(itemBlock);
        }

        //create and populate projects
        let projectTemplate = `
        <div class="todo-wrapper" js-project-id=${projectList.indexOf(projectName)}>
          <h3>${projectName}</h3>
          ${itemBlock.outerHTML}
        <button>test</button>
        </div>`;

        content.insertAdjacentHTML('beforeend', projectTemplate);
    }
    addEvents();
}

addProjects();

//strike out
function addEvents() {
    function strikeItem() {
        this.classList.toggle('completed');
    }

    let listItems = document.querySelectorAll('.todo-wrapper > ul > li');
    listItems.forEach((x) => x.addEventListener('click', strikeItem));
}
