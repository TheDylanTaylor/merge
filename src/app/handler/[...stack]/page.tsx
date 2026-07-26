// Hexclave (Stack Auth) hosted auth handler — sign-in, sign-up, account, etc.
// Only active when Hexclave keys are configured; otherwise 404 (keyless mode).
import { StackHandler } from "@stackframe/stack";
import { notFound } from "next/navigation";
import { stackServerApp } from "@/lib/hexclave";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Handler(props: any) {
  if (!stackServerApp) return notFound();
  return <StackHandler fullPage app={stackServerApp} routeProps={props} />;
}
