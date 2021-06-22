interface IUser {
  email: string;
  password: string;
  username: string;
  token: string;
  verified: boolean;
}

interface IMinimalUser {
  email: string;
  username: string;
}
