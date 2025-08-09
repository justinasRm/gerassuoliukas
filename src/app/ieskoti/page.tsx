import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { IeskotiScreen } from "../components/pages/IeskotiScreen";

export default async function Ieskoti() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return <IeskotiScreen />;
}
