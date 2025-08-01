import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { SignInScreen } from "../components/pages/SignInScreen";

export default async function SignIn() {
  const session = await auth();

  if (session?.user) {
    redirect("/zemelapis");
  }

  return <SignInScreen />;
}
