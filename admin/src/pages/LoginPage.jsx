import { SignIn, SignInButton } from "@clerk/clerk-react";
function LoginPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <SignInButton mode="modal" className="bg-blue-500 text-white px-4 py-2 rounded" />
    </div>
  );
}

export default LoginPage;
