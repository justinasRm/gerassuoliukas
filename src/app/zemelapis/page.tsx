import { auth } from "~/server/auth";
import { ZemelapisScreen } from "../components/pages/ZemelapisScreen";
import { redirect } from "next/navigation";

export default async function Zemelapis() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return <ZemelapisScreen />;
}
