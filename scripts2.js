const firebaseConfig = {
  apiKey: "AIzaSyATxRE40okbcvn5GXC4CicHRDRrJYpruIQ",
  authDomain: "listavenda.firebaseapp.com",
  databaseURL: "https://listavenda-default-rtdb.firebaseio.com",
  projectId: "listavenda",
  storageBucket: "listavenda.appspot.com",
  messagingSenderId: "146426502512",
  appId: "1:146426502512:web:151cff147d7718647b83b5"
};

  // Inicializar o Firebase
  firebase.initializeApp(firebaseConfig);
  const firestore = firebase.firestore();

  const saveTodoFirebase = async (text, done = false) => {
    const todosCollection = firestore.collection("todos");
    const newTodo = { text, done };

    try {
      await todosCollection.add(newTodo);
      console.log("Tarefa salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar a tarefa:", error);
    }
  };

  const deleteTodoFirebase = async (id) => {
    const todoDoc = firestore.collection("todos").doc(id);

    try {
      await todoDoc.delete();
      console.log("Tarefa excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir a tarefa:", error);
    }
  };

  const updateTodoFirebase = async (id, text, done) => {
    const todoDoc = firestore.collection("todos").doc(id);

    try {
      await todoDoc.update({ text, done });
      console.log("Tarefa atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar a tarefa:", error);
    }
  };

  const getTodosFirebase = () => {
    const todosCollection = firestore.collection("todos");
    const todosQuery = todosCollection.orderBy("done", "asc");

    todosQuery.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const todo = {
          id: change.doc.id,
          ...change.doc.data()
        };

        if (change.type === "added") {
          saveTodo(todo.text, todo.done, false);
        } else if (change.type === "removed") {
          removeTodoElement(todo.id);
        } else if (change.type === "modified") {
          updateTodoElement(todo.id, todo.text, todo.done);
        }
      });
    });
  };

  const todoForm = document.getElementById("todo-form");
  const todoInput = document.getElementById("todo-input");
  const todoList = document.getElementById("todo-list");

  const saveTodo = (text, done = false, saveToFirebase = true) => {
    const todoElement = createTodoElement(text, done);
    todoList.appendChild(todoElement);
    if (saveToFirebase) {
      saveTodoFirebase(text, done);
    }
  };

  const removeTodoElement = (id, deleteFromFirebase = true) => {
    const todoElement = document.getElementById(id);
    todoList.removeChild(todoElement);
    if (deleteFromFirebase) {
      deleteTodoFirebase(id);
    }
  };

  const updateTodoElement = (id, text, done) => {
    const todoElement = document.getElementById(id);
    const todoTextElement = todoElement.querySelector(".todo-text");
    const todoCheckbox = todoElement.querySelector(".todo-checkbox");

    todoTextElement.textContent = text;
    todoCheckbox.checked = done;
  };

  const createTodoElement = (text, done) => {
    const todoElement = document.createElement("div");
    todoElement.classList.add("todo");
    todoElement.id = Date.now().toString();

    const todoTextElement = document.createElement("h3");
    todoTextElement.classList.add("todo-text");
    todoTextElement.textContent = text;

    const todoCheckbox = document.createElement("input");
    todoCheckbox.classList.add("todo-checkbox");
    todoCheckbox.type = "checkbox";
    todoCheckbox.checked = done;
    todoCheckbox.addEventListener("change", () => {
      updateTodoFirebase(todoElement.id, text, todoCheckbox.checked);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("edit-todo");
    editButton.innerHTML = `<i class="fa-solid fa-pencil"></i>`;
    editButton.addEventListener("click", () => {
      editTodoElement(todoElement.id, text);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-todo");
    deleteButton.innerHTML = `<i class="fa-solid fa-trash"></i>`;
    deleteButton.addEventListener("click", () => {
      removeTodoElement(todoElement.id);
    });

    todoElement.appendChild(todoTextElement);
    todoElement.appendChild(todoCheckbox);
    todoElement.appendChild(editButton);
    todoElement.appendChild(deleteButton);

    return todoElement;
  };

  const editForm = document.getElementById("edit-form");
  const editInput = document.getElementById("edit-input");
  const cancelEditButton = document.getElementById("cancel-edit-btn");

  const editTodoElement = (id, text) => {
    editForm.classList.remove("hide");
    editInput.value = text;
    editInput.focus();

    editForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newText = editInput.value.trim();
      if (newText !== "") {
        updateTodoElement(id, newText, false);
        updateTodoFirebase(id, newText, false);
        editForm.reset();
        editForm.classList.add("hide");
      }
    });

    cancelEditButton.addEventListener("click", () => {
      editForm.reset();
      editForm.classList.add("hide");
    });
  };

  todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text !== "") {
      saveTodo(text);
      todoForm.reset();
    }
  });

  getTodosFirebase();