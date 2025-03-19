import React, { useEffect, useState } from 'react';
import { axiosInstance } from "../lib/axios.js";
import Cookies from 'js-cookie';
import '../css/Dashboard.css';
import toast from "react-hot-toast";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [editBlog, setEditBlog] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState('');
    const [blogIdToDelete, setBlogIdToDelete] = useState(null);

    useEffect(() => {
        fetchUserData();
        fetchBlogs();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await axiosInstance.get('/users/me', {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('accessToken')}`
                }
            });
            setUser(response.data.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const fetchBlogs = async () => {
        try {
            const response = await axiosInstance.get("/blogs", {
                headers: {
                    Authorization: `Bearer ${Cookies.get("accessToken")}`,
                },
            });
            setBlogs(response.data.blogs);
        } catch (error) {
            console.error("Error fetching blogs:", error);
        }
    };
    

    const handleLogout = () => {
        Cookies.remove('accessToken');
        toast.success("Logout Successfully");
        window.location.href = '/login';
    };

    const handleCreateOrUpdateBlog = async (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        
        if (image && typeof image !== "string") {
            formData.append("image", image);  // Send file directly
        }
    
        try {
            if (editBlog) {
                await axiosInstance.put(`/blogs/${editBlog._id}`, formData, {
                    headers: {
                        "Authorization": `Bearer ${Cookies.get("accessToken")}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
                toast.success("Blog updated successfully!");
                setMessage("Blog updated successfully!");
            } else {
                await axiosInstance.post("/blogs", formData, {
                    headers: {
                        "Authorization": `Bearer ${Cookies.get("accessToken")}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
                toast.success("Blog created successfully!");
                setMessage("Blog created successfully!");
            }
    
            // Reset state after successful operation
            setTitle("");
            setDescription("");
            setImage(null);
            setEditBlog(null);
            fetchBlogs();
        } catch (error) {
            setMessage("Failed to save blog.");
            console.error("Error saving blog:", error);
        }
    };
    

    const handleDelete = async (blogId) => {
        try {
            await axiosInstance.delete(`/blogs/${blogId}`, {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('accessToken')}`
                }
            });
            toast.success("Blog deleted Successfully");
            fetchBlogs();
        } catch (error) {
            console.error('Error deleting blog:', error);
            setMessage('Failed to delete blog.');
            toast.error("Failed to delete blog");
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <button onClick={handleLogout} className="logout-button">Logout</button>
                {user && user.avatar && (
                    <img src={user.avatar} alt="User Avatar" className="user-image" />
                )}
            </div>
            <div className="dashboard-content">
                <h1>Welcome to Your Dashboard</h1>
                <form className="blog-form" onSubmit={handleCreateOrUpdateBlog}>
                    <input
                        type="text"
                        placeholder="Blog Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Blog Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                    {image && typeof image === 'string' ? (
                        <img src={image} alt="Blog Preview" className="blog-image-preview" />
                    ) : image ? (
                        <img src={URL.createObjectURL(image)} alt="New Preview" className="blog-image-preview" />
                    ) : null}

                    <button type="submit">{editBlog ? 'Update Blog' : 'Create Blog'}</button>
                    {message && <p className="message">{message}</p>}
                </form>

                <h2>Blog List</h2>
                <ul>
    {blogs.map((blog) => (
        <li key={blog._id}>
            <h3>{blog.title}</h3>
            <img src={blog.image} alt={blog.title} className="blog-image" />
            <p>{blog.description}</p>
            <button onClick={() => { setEditBlog(blog); setTitle(blog.title); setDescription(blog.description); setImage(blog.image); }}>
                Edit
            </button>
            <button onClick={() => handleDelete(blog._id)}>Delete</button>
        </li>
    ))}
</ul>

            </div>
        </div>
    );
};

export default Dashboard;
