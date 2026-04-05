import { HomeWorkspace } from "@/components/website/HomeWorkspace";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <HomeWorkspace searchParams={await searchParams} />;
}
