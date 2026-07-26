import ReviewClient from "@/components/ReviewClient";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReviewClient id={id} />;
}
