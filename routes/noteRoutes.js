
const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/noteController");

router.post("/", createNote);
router.patch("/all", updateAllNotesTitles);
router.put("/replace/:noteId", replaceNote);
router.get("/paginate-sort", getNotesPaginateSort);
router.get("/note-by-content", getNoteByContent);
router.delete("/", deleteAllUserNotes);
router.delete("/:noteId", deleteNote);
router.patch("/:noteId", updateNote);
router.get("/note-with-user", getNoteWithUser);
router.get("/aggregate", aggregateNotes);
router.get("/:id", getNoteById);



module.exports = router;

