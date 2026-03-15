import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [userIdInput, setUserIdInput] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [userIsLoading, setUserIsLoading] = useState(false)

  const [allPosts, setAllPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [postIsLoading, setPostIsLoading] = useState(true)

  const [todos, setTodos] = useState([])
  const [newTodoTitle, setNewTodoTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [todoError, setTodoError] = useState(null)

  const baseUrl = "https://jsonplaceholder.typicode.com";

  useEffect(() => {
    async function initData() {
      try {
        const [postsRes, todosRes] = await Promise.all([
          fetch(`${baseUrl}/posts`),
          fetch(`${baseUrl}/todos?_limit=5`)
        ]);
        const postsData = await postsRes.json();
        const todosData = await todosRes.json();
        
        setAllPosts(postsData);
        setFilteredPosts(postsData);
        setTodos(todosData);
      } catch (error) {
        console.error(error);
      } finally {
        setPostIsLoading(false);
      }
    }
    initData();
  }, []);

  useEffect(() => {
    const result = allPosts.filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPosts(result);
  }, [searchQuery, allPosts]);

  useEffect(() => {
    if (!userIdInput) {
      setSelectedUser(null);
      return;
    }
    const numId = parseInt(userIdInput);
    if (numId < 1 || numId > 10 || isNaN(numId)) {
      setSelectedUser("not_found");
      return;
    }

    const fetchUser = async () => {
      setUserIsLoading(true);
      try {
        const res = await fetch(`${baseUrl}/users/${numId}`);
        const data = await res.json();
        setSelectedUser(data);
      } catch (err) {
        setSelectedUser("not_found");
      } finally {
        setUserIsLoading(false);
      }
    };
    fetchUser();
  }, [userIdInput]);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    setIsSubmitting(true);
    setTodoError(null);

    const newTodoObj = {
      title: newTodoTitle,
      completed: false,
      userId: 1
    };

    try {
      const res = await fetch(`${baseUrl}/todos`, {
        method: 'POST',
        body: JSON.stringify(newTodoObj),
        headers: { 'Content-type': 'application/json; charset=UTF-8' }
      });

      if (!res.ok) throw new Error("Thêm công việc thất bại");
      
      const savedTodo = await res.json();
      setTodos([{ ...savedTodo, id: Date.now() }, ...todos]);
      setNewTodoTitle("");
    } catch (err) {
      setTodoError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTodo = async (id) => {
    const originalTodos = [...todos];
    setTodos(todos.filter(t => t.id !== id));

    try {
      const res = await fetch(`${baseUrl}/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
    } catch (err) {
      setTodos(originalTodos);
      alert("Lỗi: Không thể xóa mục này.");
    }
  };

  return (
    <div className="app-container">
      <section className="section">
        <h2>Tìm kiếm người dùng (ID 1-10)</h2>
        <input
          type="number"
          value={userIdInput}
          onChange={(e) => setUserIdInput(e.target.value)}
          placeholder="Nhập ID người dùng..."
          className="main-input"
        />
        <div className="status-area">
          {userIsLoading ? <p>Đang tải thông tin...</p> : 
            selectedUser === "not_found" ? <p className="error">Không tìm thấy người dùng</p> :
            selectedUser && (
              <div className="info-box">
                <p><strong>Họ tên:</strong> {selectedUser.name}</p>
                <p><strong>Điện thoại:</strong> {selectedUser.phone}</p>
                <p><strong>Website:</strong> {selectedUser.website}</p>
              </div>
            )
          }
        </div>
      </section>

      <hr />

      <section className="section">
        <h2>Quản lý công việc (CRUD)</h2>
        <form onSubmit={handleAddTodo} className="todo-form">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="Bạn cần làm gì?"
            disabled={isSubmitting}
          />
          <button type="submit" disabled={isSubmitting || !newTodoTitle.trim()}>
            {isSubmitting ? "Đang thêm..." : "Thêm"}
          </button>
        </form>
        {todoError && <p className="error">{todoError}</p>}
        
        <ul className="todo-list">
          {todos.map(todo => (
            <li key={todo.id} className="todo-item">
              <span>{todo.title}</span>
              <button onClick={() => handleDeleteTodo(todo.id)} className="btn-del">Xóa</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />

      <section className="section">
        <h2>Khám phá bài viết (Tìm kiếm)</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm bài viết theo tiêu đề..."
          className="main-input"
        />
        <div className="scroll-box">
          {postIsLoading ? <p>Đang tải bài viết...</p> : 
            filteredPosts.map(post => (
              <div key={post.id} className="small-card">
                <strong>{post.id}. {post.title}</strong>
              </div>
            ))
          }
        </div>
      </section>
    </div>
  )
}

export default App