import { useFireproof } from 'use-fireproof'
import type { DocBase } from 'use-fireproof'
import { useState } from 'react'

// Partial<DocBase> makes all DocBase properties optional
interface Todo extends Partial<DocBase> {
  todo: string
  type: string
  completed: boolean
  createdAt: number
}

function App() {
  const { useLiveQuery, database } = useFireproof("todo-list-db")
  const [newTodo, setNewTodo] = useState('')

  const { docs } = useLiveQuery("type", { 
    key: "todo",
    descending: true 
  })
  
  // Type assertion to treat the docs as Todo items
  const todos = docs as Todo[]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodo(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodo.trim() === "") return
    database.put({
      todo: newTodo,
      type: "todo",
      completed: false,
      createdAt: Date.now()
    })
    setNewTodo('')
  }

  const toggleComplete = (doc: Todo) => {
    database.put({ ...doc, completed: !doc.completed })
  }

  const deleteTodo = (id: string) => {
    database.del(id)
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Todo List</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <label htmlFor="todo" className="block mb-2 font-semibold">New Todo</label>
        <div className="flex gap-2">
          <input
            className="flex-grow border border-gray-300 rounded px-2 py-1"
            id="todo"
            type="text"
            onChange={handleInputChange}
            value={newTodo}
            placeholder="What needs to be done?"
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition-colors"
          >
            Add
          </button>
        </div>
      </form>

      {todos.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No todos yet. Add one above!</p>
      ) : (
        <ul className="space-y-3">
          {todos.map((doc) => (
            <li className="flex flex-col items-start p-2 border border-gray-200 rounded bg-gray-50" key={doc._id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <input
                    className="mr-2"
                    type="checkbox"
                    checked={doc.completed}
                    onChange={() => toggleComplete(doc)}
                  />
                  <span className={`font-medium ${doc.completed ? 'line-through text-gray-400' : ''}`}>
                    {doc.todo}
                  </span>
                </div>
                <button
                  className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                  onClick={() => deleteTodo(doc._id as string)}
                >
                  Delete
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(doc.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
