// create variable to hold db connection
let db;

//establish a connection to IndexedDb database and set to verision 1
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    //save reference to db
    const db = event.target.result;
    //create object store
    db.createObjectStore('new_budget', {autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine)  {
        // function();
        uploadBudget();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    // open new transaction with db
    const transaction = db.transaction(['new_budget'], 'readwrite');
    //access object store 
    const budgetObjectStore = transaction.objectStore('new_budget');

    // add record to store 
    budgetObjectStore.add(record);
}

function uploadBudget() {
    // open transaction
    const transaction = db.transaction(['new_budget'], 'readwrite');

    //access object store
    const budgetObjectStore = transaction.objectStore('new_budget');

    // get all records
    const getAll = budgetObjectStore.getAll();

    // upon success
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch(`/api/transaction/bulk`, {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(respone => response.json())
            .then(ServerResponse => {
                if (ServerResponse.message) {
                    throw new Error(serverResponse);
                }
                // open another transaction
                const transaction = db.transaction(['new_budget'], 'readwrite');
                //access store
                const budgetObjectStore = transaction.objectStore('new_budget');
                // clear store
                budgetObjectStore.clear();

                alert('All saved budgets have been submitted.');
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
};

// listen for app to come back online
window.addEventListener('online', uploadBudget);
