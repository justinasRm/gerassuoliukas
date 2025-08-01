import { auth } from "~/server/auth";
import { SignInPage } from "../components/pages/SignInPage";
import { redirect } from "next/navigation";

export default async function SignIn() {
  const session = await auth();

  if (session?.user) {
    redirect("/zemelapis");
  }

  return <SignInPage />;
}
