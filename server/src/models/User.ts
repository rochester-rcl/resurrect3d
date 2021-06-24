import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcrypt";
import * as Mail from "../utils/mail";

export interface IUserDocument extends Document, IUser {}

export const UserSchema = new Schema<IUserDocument>({
  email: {
    type: String,
    required: true,
    index: {
      unique: true,
      dropDups: true
    }
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    index: {
      unique: true,
      dropDups: true
    }
  },
  token: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    required: true,
    default: false
  }
  // not sure what else we want but this will do for now, probably first, last, institution etc
});

UserSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

function formatLink(token: string) {
  return `<a href="${Mail.config.verificationRoute}${token}">Verify your Resurrect3D Account</a>`;
}

UserSchema.methods.sendVerificationEmail = function (): Promise<void> {
  const message = {
    to: this.email,
    html: Mail.greeting + formatLink(this.token),
    ...Mail.message
  };
  return new Promise((resolve, reject) => {
    Mail.transporter.sendMail(message, (err: Error | null) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
};

const UserModel = mongoose.model<IUserDocument>("User", UserSchema);
export default UserModel;
