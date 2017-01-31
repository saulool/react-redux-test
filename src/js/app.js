import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import axios from 'axios';

var defaultState = {
  todo: {
    items: []
  }
};

function apiCallError(error){
  return {
    type: 'API_CALL_ERROR',
    error: error
  }
}

function dataReceived(data){
  return {
    type: 'DATA_RECEIVED',
    data: data
  }
}

function addTodo(message) {
  return {
    type: 'ADD_TODO',
    message: message,
    completed: false
  };
}

function completeTodo(index) {
  return {
    type: 'COMPLETE_TODO',
    index: index
  };
}

function deleteTodo(index) {
  return {
    type: 'DELETE_TODO',
    index: index
  };
}

function clearTodo() {
  return {
    type: 'CLEAR_TODO'
  };
}

function todoApp(state, action) {
  console.log(state);
  switch (action.type) {
    case 'ADD_TODO':
      var items = [].concat(state.todo.items);
      return Object.assign({}, {
        todo: {
          items: items.concat([{
            message: action.message,
            completed: false
          }])
        }
      });

    case 'COMPLETE_TODO':
      var items = [].concat(state.todo.items);

      items[action.index].completed = true;

      return Object.assign({}, state, {
        todo: {
          items: items
        }
      });

    case 'DELETE_TODO':
      console.log('delete');
      var items = [].concat(state.todo.items);

      items.splice(action.index, 1);

      return Object.assign({}, state, {
        todo: {
          items: items
        }
      });

    case 'CLEAR_TODO':
      return Object.assign({}, state, {
        todo: {
          items: []
        }
      });

    case 'DATA_RECEIVED':
      console.log('data recevied');
      console.log(action.data);
      console.log(action.data.data[0].name);

      var names = [];

      action.data.data.forEach(item => {
        names.push({message: item.name, completed: false});
      });

      console.log(names);

      var items = [].concat(state.todo.items);
      return Object.assign({}, {
        todo: {
          items: items.concat(names)
        }
      });

    case 'API_CALL_ERROR':
      console.log(action.error);
      return Object.assign({}, {
        todo: {
          items: [{message: 'Error while fetching API', completed: false}]
        }
      });

    default:
      return state;
  }
}

var store = createStore(todoApp, defaultState);

class AddTodoForm extends React.Component {
  state = {
    message: ''
  };

  onFormSubmit(e) {
    e.preventDefault();
    store.dispatch(addTodo(this.state.message));
    this.setState({ message: '' });
  }

  onMessageChanged(e) {
    var message = e.target.value;
    this.setState({ message: message });
  }

  getData(e) {
    e.preventDefault();

    axios.get('https://jsonplaceholder.typicode.com/comments')
    .then(function (response) {
      store.dispatch(dataReceived(response));
    })
    .catch(function (error) {
      store.dispatch(apiCallError(error));
    });
  }

  clearTodos(e){
    e.preventDefault();
    store.dispatch(clearTodo());
  }

  render() {
    return (
      <form onSubmit={this.onFormSubmit.bind(this)}>
        <input type="text" placeholder="Todo..." onChange={this.onMessageChanged.bind(this)} value={this.state.message} />
        <input type="submit" value="Add" />
        <a href="#" onClick={this.getData.bind(this)}>Get Todos</a>
        <a href="#" onClick={this.clearTodos.bind(this)}>Clear Todos</a>
      </form>
    );
  }
}

class TodoItem extends React.Component {
  onDeleteClick(e) {
    e.preventDefault();
    store.dispatch(deleteTodo(this.props.index));
  }

  onCompletedClick() {
    store.dispatch(completeTodo(this.props.index));
  }

  render() {
    return (
      <li>
        <a href="#" onClick={this.onCompletedClick.bind(this)} style={{textDecoration: this.props.completed ? 'line-through' : 'none'}}>{this.props.message.trim()}</a>&nbsp;
        <a href="#" onClick={this.onDeleteClick.bind(this)} style={{textDecoration: 'none'}}>[x]</a>
      </li>
    );
  }
}

class TodoList extends React.Component {
  state = {
    items: []
  };

  componentWillMount() {
    store.subscribe(() => {
      var state = store.getState();
      this.setState({
        items: state.todo.items
      });
    });
  }

  render() {
    var items = [];

    this.state.items.forEach((item, index) => {
      items.push(<TodoItem
        key={index}
        index={index}
        message={item.message}
        completed={item.completed}
      />);
    });

    if (!items.length) {
      return (
        <p>
          <i>Please add something to do.</i>
        </p>
      );
    }

    return (
      <ol>{ items }</ol>
    );
  }
}

ReactDOM.render(
  <div>
    <h1>Todo</h1>
    <AddTodoForm />
    <TodoList />
  </div>,
  document.getElementById('container')
);