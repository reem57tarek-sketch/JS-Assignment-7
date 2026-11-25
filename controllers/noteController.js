
const Note = require("../models/noteModel");
const User = require("../models/userModel");

// Create Note
const createNote = async (req, res) => {
    try {
        const { title, content, userId } = req.body;

        if (!title || !content || !userId) {
            return res.status(400).json({
                message: "Title, content and userId are required"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const note = await Note.create({
            title,
            content,
            userId
        });

        res.status(201).json({
            message: "Note created successfully",
            note
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Update Note
const updateNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { title, content, userId } = req.body;

        const note = await Note.findById(noteId);

        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        if (!userId || note.userId.toString() !== userId) {
            return res.status(403).json({
                message: "You are not allowed to update this note"
            });
        }

        const updatedNote = await Note.findByIdAndUpdate(
            noteId,
            { title, content },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Note updated successfully",
            note: updatedNote
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const replaceNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { title, content, userId } = req.body;

        if (!title || !content || !userId) {
            return res.status(400).json({
                message: "Title, content and userId are required"
            });
        }

        const note = await Note.findById(noteId);

        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        if (note.userId.toString() !== userId) {
            return res.status(403).json({
                message: "You are not allowed to replace this note"
            });
        }

        const replacedNote = await Note.findByIdAndUpdate(
            noteId,
            {
                $set: {
                    title,
                    content,
                    userId
                }
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Note replaced successfully",
            note: replacedNote
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const updateAllNotesTitles = async (req, res) => {
    try {
        const { userId, title } = req.body;

        if (!userId || !title) {
            return res.status(400).json({
                message: "userId and title are required"
            });
        }

        const result = await Note.updateMany(
            { userId },
            { $set: { title } },
            { runValidators: true }
        );

        res.status(200).json({
            message: "All notes titles updated successfully",
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const deleteNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { userId } = req.body;

        const note = await Note.findById(noteId);

        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        if (!userId || note.userId.toString() !== userId) {
            return res.status(403).json({
                message: "You are not allowed to delete this note"
            });
        }

        await Note.findByIdAndDelete(noteId);

        res.status(200).json({
            message: "Note deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const getNotesPaginateSort = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 3;

        const skip = (page - 1) * limit;

        const notes = await Note.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            message: "Notes fetched successfully",
            page,
            limit,
            notes
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const getNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        const note = await Note.findById(id);

        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        if (!userId || note.userId.toString() !== userId) {
            return res.status(403).json({
                message: "You are not allowed to view this note"
            });
        }

        res.status(200).json({
            message: "Note fetched successfully",
            note
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const getNoteByContent = async (req, res) => {
    try {
        const { content } = req.query;

        if (!content) {
            return res.status(400).json({
                message: "Content is required"
            });
        }

        const notes = await Note.find({
            content: { $regex: content, $options: "i" }
        });

        res.status(200).json({
            message: "Notes fetched successfully",
            notes
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getNoteWithUser = async (req, res) => {
    try {
        const notes = await Note.find()
            .select("title userId createdAt")
            .populate("userId", "email");

        res.status(200).json({
            message: "Notes fetched successfully",
            notes
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const aggregateNotes = async (req, res) => {
    try {
        const { title } = req.query;

        const notes = await Note.aggregate([
            {
                $match: {
                    title: { $regex: title || "", $options: "i" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    title: 1,
                    content: 1,
                    createdAt: 1,
                    "user.name": 1,
                    "user.email": 1
                }
            }
        ]);

        res.status(200).json({
            message: "Aggregation completed successfully",
            notes
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const deleteAllUserNotes = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                message: "userId is required"
            });
        }

        const result = await Note.deleteMany({ userId });

        res.status(200).json({
            message: "All user notes deleted successfully",
            deletedCount: result.deletedCount
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createNote,
    updateNote,
    replaceNote,
    updateAllNotesTitles,
    deleteNote,
    getNotesPaginateSort,
    getNoteById,
    getNoteByContent,
    getNoteWithUser,
    aggregateNotes,
    deleteAllUserNotes 
    
};
