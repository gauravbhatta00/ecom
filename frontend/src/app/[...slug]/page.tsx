import type { Metadata } from "next";
import { LegacyApp } from "@/components/legacy-app";
import { notFound } from "next/navigation";
import { isLegacyRoute, isPrivateRoute, routeTitles } from "@/lib/routes";

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug = [] } = await params;
  const path = `/${slug.join("/")}`;
  return { ...(routeTitles[slug[0]] ? { title: routeTitles[slug[0]] } : {}), alternates: { canonical: path }, ...(isPrivateRoute(path) ? { robots: { index: false, follow: false } } : {}) };
}

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  if (!isLegacyRoute(`/${slug.join("/")}`)) notFound();
  return <LegacyApp />;
}
