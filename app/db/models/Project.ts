// db/models/Project.ts
import { Schema, model, models } from "mongoose";

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    domain: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    content: { type: String, default: null },
    lastPostedIndex: { type: Number, default: 0 },
    note: { type: String },
  },
  { timestamps: true }
);

// Avoid recompiling model in dev mode
const Project = models.Project || model("Project", ProjectSchema);
export default Project;
