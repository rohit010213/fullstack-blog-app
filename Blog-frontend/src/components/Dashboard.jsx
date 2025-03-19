import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios.js";
import Cookies from "js-cookie";
import "../css/Dashboard.css";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [editBlog, setEditBlog] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchBlogs();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get("/users/me");
      setUser(response.data.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await axiosInstance.get("/blogs");
      setBlogs(response.data.blogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const handleLogout = () => {
    Cookies.remove("accessToken");
    toast.success("Logout Successfully");
    window.location.href = "/login";
  };

  const handleCreateOrUpdateBlog = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (image && typeof image !== "string") {
      formData.append("image", image);
    }

    try {
      if (editBlog) {
        if (!image || typeof image === "string") {
          formData.append("existingImage", editBlog.image);
        }

        await axiosInstance.put(`/blogs/${editBlog._id}`, formData);
        toast.success("Blog updated successfully!");
      } else {
        await axiosInstance.post("/blogs", formData);
        toast.success("Blog created successfully!");
      }
      setTitle("");
      setDescription("");
      setImage(null);
      setEditBlog(null);
      fetchBlogs();
    } catch (error) {
      toast.error("Failed to save blog.");
      console.error("Error saving blog:", error);
    }
  };

  const handleEdit = (blog) => {
    setEditBlog(blog);
    setTitle(blog.title);
    setDescription(blog.description);
    setImage(blog.image);

    // Scroll to the form when editing a blog
    document.getElementById("blog-form").scrollIntoView({ behavior: "smooth" });
};



  const handleDelete = async (blogId) => {
    try {
      await axiosInstance.delete(`/blogs/${blogId}`);
      toast.success("Blog deleted Successfully");
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog");
    }
  };


  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
        {user && user.avatar && (
          <img src={user.avatar} alt="User Avatar" className="user-image" />
        )}
      </div>
      <div className="dashboard-content">
        <h1>Welcome to Your Dashboard</h1>
        <form id="blog-form" className="blog-form" onSubmit={handleCreateOrUpdateBlog}>
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
          <button type="submit">
            {editBlog ? "Update Blog" : "Create Blog"}
          </button>
        </form>

        <h2>Blog List</h2>
        <div className="blog-list">
          {blogs.map((blog) => (
            <div className="blog-card" key={blog._id}>
              <img src={blog.image} alt={blog.title} className="blog-image" />
              <div className="blog-content">
                <h3 className="blog-title">{blog.title}</h3>
                <p className="blog-description">
                  {blog.description.length > 100
                    ? `${blog.description.substring(0, 100)}...`
                    : blog.description}
                </p>
                {blog.description.length > 100 && (
                  <button
                    className="read-more"
                    onClick={() => setSelectedBlog(blog)}
                  >
                    Read More
                  </button>
                )}
                <div className="blog-actions">
                  <button className="edit-btn" onClick={() => handleEdit(blog)}>
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(blog._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedBlog && (
        <div className="modal-overlay" onClick={() => setSelectedBlog(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-modal"
              onClick={() => setSelectedBlog(null)}
            >
              ×
            </button>
            <h2>{selectedBlog.title}</h2>
            <img
              src={selectedBlog.image}
              alt={selectedBlog.title}
              className="modal-image"
            />
            <p className="modal-para">{selectedBlog.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
