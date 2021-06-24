interface IUser {
  email: string;
  password: string;
  username: string;
  token: string;
  verified: boolean;
  validPassword: (password: string) => boolean;
  sendVerificationEmail: () => Promise<void>;
}

interface IMinimalUser {
  email: string;
  username: string;
}
