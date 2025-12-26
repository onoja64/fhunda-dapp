import { redirect } from "next/navigation";

export default function Discover() {
  // Consolidate discovery into /explore to avoid duplicate pages
  redirect("/explore");
}
