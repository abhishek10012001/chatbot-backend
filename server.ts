import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { db } from "./firebase";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/messages", async (req: Request, res: Response): Promise<void> => {
    try {
      const { text, user }: { text: string; user: string } = req.body;
  
      if (!text || !user) {
        res.status(400).json({ error: "Text and user are required" });
        return;
      }
  
      const docRef = await db.collection("messages").add({
        text,
        user,
        timestamp: new Date(),
      });
  
      res.status(201).json({ message: "Message saved", id: docRef.id });
    } catch (error) {
      console.error("Error saving message:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

const PORT: number = parseInt(process.env.PORT || "5001", 10);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
