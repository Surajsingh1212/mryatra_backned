const Blog = require("../models/Blog");

// Create new blog
exports.createBlog = async (req, res) => {
    try {
        const { title, metaKeyword, metaDescription, blogDescription, status } = req.body;

        let image = null;
        if (req.file) {
            image = req.file.filename;
        }

        const newBlog = new Blog({
            title,
            metaKeyword,
            metaDescription,
            blogDescription,
            status,
            image,
        });

        await newBlog.save();
        res.status(201).json({ message: "Blog created successfully", blog: newBlog });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all blogs
exports.getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single blog by ID
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update blog
exports.updateBlog = async (req, res) => {
    try {
        const { title, metaKeyword, metaDescription, blogDescription, status } = req.body;

        let updateData = { title, metaKeyword, metaDescription, blogDescription, status };

        if (req.file) {
            updateData.image = req.file.filename; // replace old image
        }

        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
        });

        if (!updatedBlog) return res.status(404).json({ message: "Blog not found" });

        res.status(200).json({ message: "Blog updated successfully", blog: updatedBlog });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete blog
exports.deleteBlog = async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if (!deletedBlog) return res.status(404).json({ message: "Blog not found" });
        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
