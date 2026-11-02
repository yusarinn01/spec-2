export function authMessage(code) {
  switch (code) {
    case "auth/invalid-email":
      return "That email address isn't valid.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Log in instead.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email or password is incorrect.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "No internet connection. Check your network and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
