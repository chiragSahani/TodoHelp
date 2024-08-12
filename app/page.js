"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

const Page = () => {
  // State variables
  const [title, setTitle] = useState(""); // Task title input
  const [description, setDescription] = useState(""); // Task description input
  const [AllTask, setAllTask] = useState([]); // List of all tasks
  const [Error, setError] = useState(""); // Error message for validation
  const [searchMessage, setSearchMessage] = useState(""); // Message for search results
  const [editIndex, setEditIndex] = useState(null); // Index of task being edited
  const [searchQuery, setSearchQuery] = useState(""); // Query for filtering tasks
  const [searchInput, setSearchInput] = useState(""); // Search input field value
  const [expandedTask, setExpandedTask] = useState(null); // Index of expanded task
  const searchParams = useSearchParams();
  const router = useRouter();

  // Fetch tasks from JSON file on component mount
  useEffect(() => {
    fetch('/task.json')
      .then(response => response.json())
      .then(data => setAllTask(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  // Update search query and input from URL parameters
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
      setSearchInput(search);
    }
  }, [searchParams]);

  // Handle form submission for adding or updating tasks
  const submitHandler = (e) => {
    e.preventDefault();
    if (title.trim() === "" || description.trim() === "") {
      setError("Title and description cannot be empty");
      return;
    }

    const now = new Date().toLocaleString();
    if (editIndex !== null) {
      // Update existing task
      const updatedTasks = AllTask.map((task, index) =>
        index === editIndex ? { title, description, completed: task.completed, timestamp: now } : task
      );
      setAllTask(updatedTasks);
      setEditIndex(null);
    } else {
      // Add new task
      setAllTask([...AllTask, { title, description, completed: false, timestamp: now }]);
    }
    // Clear input fields
    setTitle("");
    setDescription("");
    setSearchQuery("");
    setSearchInput("");
    setError("");
  };

  // Handle editing of a task
  const handleEdit = (index) => {
    setEditIndex(index);
    setTitle(AllTask[index].title);
    setDescription(AllTask[index].description);
  };

  // Handle deletion of a task
  const handleDelete = (index) => {
    setAllTask(AllTask.filter((_, i) => i !== index));
  };

  // Handle checkbox state change for a task
  const handleCheckboxChange = (index) => {
    const updatedTasks = AllTask.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setAllTask(updatedTasks);
  };

  // Handle search button click
  const handleSearchClick = () => {
    const search = searchInput.trim();
    if (search === "") {
      setSearchQuery(search);
      setSearchMessage("Enter a task to search");
    } else {
      setSearchQuery(search);
      setSearchMessage("No matching results");
    }
  };

  // Handle changes in search input field
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    setSearchMessage(""); 
    if (value === "") {
      setSearchQuery(""); 
    }
  };

  // Toggle expansion of task details
  const handleToggleExpand = (index) => {
    setExpandedTask(expandedTask === index ? null : index);
  };

  // Filter tasks based on search query
  const filteredTasks = AllTask.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render tasks with conditional expansion
  const renderTask = filteredTasks.map((t, i) => (
    <li key={i} className='mb-4'>
      <div className='flex flex-col p-4 bg-[#d3d3d3] border border-[#2d2929] rounded-lg shadow-md'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <input
              type="checkbox"
              checked={t.completed}
              onChange={() => handleCheckboxChange(i)}
              className='form-checkbox h-6 w-6'
            />
            <div>
              <span className={`text-lg font-semibold ${t.completed ? 'line-through text-gray-500' : 'text-[#00008b]'}`}>{t.title}</span>
            </div>
          </div>
          <div className='flex items-center space-x-3'>
            <button
              onClick={() => handleEdit(i)}
              className='text-[#00008b] hover:text-[#1abc9c] text-xl'
              title='Edit'
            >
              <i className='fas fa-edit'></i>
            </button>
            <button
              onClick={() => handleDelete(i)}
              className='text-[#e74c3c] hover:text-[#c0392b] text-xl'
              title='Delete'
            >
              <i className='fas fa-trash'></i>
            </button>
            <button
              onClick={() => handleToggleExpand(i)}
              className='text-[#9b59b6] hover:text-[#8e44ad] text-xl'
              title={expandedTask === i ? 'Collapse' : 'Expand'}
            >
              {expandedTask === i ? '-' : '+'}
            </button>
          </div>
        </div>
        {expandedTask === i && (
          <div className='mt-2'>
            <p className={`text-black ${t.completed ? 'line-through text-gray-700' : ''}`}>{t.description}</p>
            <p className='text-black text-sm'>Last updated: {t.timestamp}</p>
          </div>
        )}
      </div>
    </li>
  ));

  return (
    <div className="min-h-screen bg-[#d3d3d3] p-8">
      <h1 className='bg-[black] text-white p-5 text-2xl font-bold text-center shadow-md'>
        Todo List
      </h1>
      <div className="flex flex-col md:flex-row items-center justify-between p-5 shadow-md space-y-4 md:space-y-0">
        <form onSubmit={submitHandler} className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-2 w-full">
          <input
            type="text"
            className='flex-1 text-xl border border-[#b0b0b0] rounded-lg px-4 py-2 bg-[#2a2a2a] text-white'
            placeholder='Task title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            className='flex-1 text-xl border border-[#b0b0b0] rounded-lg px-4 py-2 bg-[#2a2a2a] text-white'
            placeholder='Task description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit" className='bg-gray-600 text-white hover:bg-gray-700 text-xl px-4 py-2 rounded-lg font-bold'>
            {editIndex !== null ? 'Update' : '+'}
          </button>
        </form>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className='flex-1 text-xl border border-[#b0b0b0] rounded-lg px-4 py-2 bg-[#2a2a2a] text-white ml-2'
            placeholder='Search tasks'
            value={searchInput}
            onChange={handleSearchInputChange}
          />
          <button
            type="button"
            className="bg-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded-lg"
            onClick={handleSearchClick}
          >
            <i className='fas fa-search text-xl'></i>
          </button>
        </div>
      </div>

      {Error && <p className='text-red-500 text-center mt-2 mb-2'>{Error}</p>}
      {searchMessage && <p className='text-blue-500 text-center mt-2 mb-2'>{searchMessage}</p>}

      <div className='p-8 bg-[#bfc2c2]'>
        <ul className='list-none pl-5'>
          {AllTask.length === 0 ? (
            <h2 className='text-center text-black'>No Task available</h2>
          ) : (
            renderTask
          )}
        </ul>
      </div>
    </div>
  );
};

export default Page;
