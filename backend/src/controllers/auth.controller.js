import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../utils/db.utils.js";
import apiResponse from "../utils/apiResponse.utils.js";

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: { username, email, password: hashedPassword },
    });

    res.status(201).json(new apiResponse(201, { id: user.id , email: user.email, username: user.username}, "User created"));
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};