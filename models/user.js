import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: { type: String, required: true },
  emailAddress: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true },
  userRole: { type: String, enum: ["admin", "user"], default: "user" },
  tasks: [{ type: Schema.Types.ObjectId, ref: "Todo" }],
});

UserSchema.pre("save", async function (next) {
  try {
    if (this.isModified("hashedPassword")) {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      this.hashedPassword = await bcrypt.hash(this.hashedPassword, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});

export const userModel = mongoose.model("User", userSchema);
