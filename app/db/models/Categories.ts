import { Schema, model, models } from "mongoose";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Category = models.Category || model("Category", CategorySchema);
export default Category;
