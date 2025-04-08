import { useFireproof } from 'use-fireproof'
import type { DocBase } from 'use-fireproof'
import { useState, useEffect } from 'react'

// Partial<DocBase> makes all DocBase properties optional
interface Todo extends Partial<DocBase> {
  todo: string
  type: string
  completed: boolean
  createdAt: number
}

function App() {
  const { database } = useFireproof("todo-list-db")
  const [newTodo, setNewTodo] = useState('')
  const [todos, setTodos] = useState<Todo[]>([])

  // Use effect to fetch todos instead of live query
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        // Get all documents from the database
        const result = await database.allDocs()
        
        // Extract documents from the response
        // The response is an array of documents
        const allDocs = result.rows as unknown as Todo[]
        
        // Filter for todo type documents and sort by createdAt (descending)
        const todoItems = allDocs
          .filter((doc: Todo) => doc.type === 'todo')
          .sort((a: Todo, b: Todo) => (b.createdAt || 0) - (a.createdAt || 0))
          
        setTodos(todoItems)
      } catch (error) {
        console.error('Error fetching todos:', error)
      }
    }
    
    fetchTodos()
  }, [database])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodo(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodo.trim() === "") return
    
    await database.put({
      todo: newTodo,
      type: "todo",
      completed: false,
      createdAt: Date.now()
    })
    
    // Fetch updated todos after adding a new one
    const result = await database.allDocs()
    const allDocs = result.rows as unknown as Todo[]
    const todoItems = allDocs
      .filter((doc: Todo) => doc.type === 'todo')
      .sort((a: Todo, b: Todo) => (b.createdAt || 0) - (a.createdAt || 0))
    setTodos(todoItems)
    setNewTodo('')
  }

  const toggleComplete = async (doc: Todo) => {
    await database.put({ ...doc, completed: !doc.completed })
    
    // Fetch updated todos after toggling completion
    const result = await database.allDocs()
    const allDocs = result.rows as unknown as Todo[]
    const todoItems = allDocs
      .filter((doc: Todo) => doc.type === 'todo')
      .sort((a: Todo, b: Todo) => (b.createdAt || 0) - (a.createdAt || 0))
    setTodos(todoItems)
  }

  const deleteTodo = async (id: string) => {
    await database.del(id)
    
    // Fetch updated todos after deleting one
    const result = await database.allDocs()
    const allDocs = result.rows as unknown as Todo[]
    const todoItems = allDocs
      .filter((doc: Todo) => doc.type === 'todo')
      .sort((a: Todo, b: Todo) => (b.createdAt || 0) - (a.createdAt || 0))
    setTodos(todoItems)
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
