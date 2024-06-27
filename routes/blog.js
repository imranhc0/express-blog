const express = require("express");
const { z } = require("zod");

const authMiddleWare = require("../middleware/authmiddleware")

const POST = require("../model/blog");

const router = express.Router()

const postSchema = z.object({
    title: z.string(),
    description: z.string(),
    imageUrl: z.string().url("URL is not Valid"),
    tags: z.string(),
})

router.post("/create", authMiddleWare, async (req, res)=> {
    try {
        const { description, title, imageUrl, tags} = req.body;
        const isDataValid = postSchema.safeParse({
            title,
            description,
            imageUrl,
            tags
        });
        if (!isDataValid.success) {
            return res.status(400).json({ msg: "Invalid data", errors: isDataValid.error.errors });
        }

        const { id } = req.user 
        const post = await POST.create({
            userID: id,
            title,
            description,
            imageUrl,
            tags
        })

        res.status(201).json({
            postID: post._id
        })

        
    
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }

})

router.get("/:postID", async (req, res)=> {
    try {
        const postId =  req.params.postID;
        const post = await POST.findById(postId);
        res.status(200).json({
            post
        })
        
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
    
})

router.put('/:postID', authMiddleWare, async (req, res) => {
    try {
        const postId = req.params.postID;
        const { description, title, imageUrl, tags } = req.body;

        const isDataValid = postSchema.safeParse({
            title,
            description,
            imageUrl,
            tags
        });
        if (!isDataValid.success) {
            return res.status(400).json({ msg: "Invalid data", errors: isDataValid.error.errors });
        }

        const findPost = await POST.findById(postId);
        if (!findPost) {
            return res.status(404).json({ msg: "Post not found" });
        }

        if (findPost.userID.toString() !== req.user.id) {
            return res.status(403).json({ msg: "You are not authorized to update this post" });
        }

        findPost.title = title;
        findPost.description = description;
        findPost.imageUrl = imageUrl;
        findPost.tags = tags;
        await findPost.save();

        res.status(200).json({
            postID: findPost._id,
            msg: "Post updated successfully"
        });
    } catch (error) {
        console.error("Error during post update:", error);
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
});

router.delete('/:postID', authMiddleWare, async (req, res) => {
    try {
        const postId = req.params.postID;

        const findPost = await POST.findById(postId);
        if (!findPost) {
            return res.status(404).json({ msg: "Post not found" });
        }

        if (findPost.userID.toString() !== req.user.id) {
            return res.status(403).json({ msg: "You are not authorized to delete this post" });
        }

        await POST.deleteOne({ _id: postId });

        res.status(200).json({
            msg: "Post deleted successfully"
        });
    } catch (error) {
        console.error("Error during post deletion:", error);
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
});


module.exports = router