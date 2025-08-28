import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: '' },
}, { timestamps: true });

userSchema.methods.setPassword = async function (pw) {
    this.passwordHash = await bcrypt.hash(pw, 12);
};
userSchema.methods.checkPassword = function (pw) {
    return bcrypt.compare(pw, this.passwordHash);
};

export default mongoose.model('User', userSchema);
