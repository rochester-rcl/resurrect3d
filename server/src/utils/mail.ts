import NodeMailer from "nodemailer";

export const config: IMailConfig = {
  username: process.env.EMAIL_USERNAME || "",
  password: process.env.EMAIL_PASSWORD || "",
  service: process.env.EMAIL_SERVICE || "",
  verificationRoute: process.env.EMAIL_VERIFICATION_ROUTE || ""
};

if (Object.values(config).some(val => val === "")) {
  throw new Error(
    "One or more properties are missing from your email config. Please check your environment varialbes"
  );
}

export const transporter = NodeMailer.createTransport({
  service: config.service,
  secure: false,
  auth: {
    user: config.username,
    pass: config.password
  }
});

export const greeting =
  "<p>Greetings from Resurrect3D! To verify your account, click on the link provided below: </p><br>";

export const message = {
  from: config.username,
  subject: "Your Resurrect3D Account"
};
