import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { findCategory } from '@/features/catalog/categories';
import { CatalogSkeleton, CatalogView } from '@/features/catalog/components/catalog-view';
import { parsePage } from '@/lib/pagination';

export async function generateMetadata({
  params,
}: PageProps<'/catalog/[category]'>): Promise<Metadata> {
  const category = findCategory((await params).category);
  return category ? { title: category.name, description: category.description } : {};
}

export default function CategoryPage({ params, searchParams }: PageProps<'/catalog/[category]'>) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CategoryResults params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CategoryResults({
  params,
  searchParams,
}: Pick<PageProps<'/catalog/[category]'>, 'params' | 'searchParams'>) {
  const [{ category: slug }, { page }] = await Promise.all([params, searchParams]);
  const category = findCategory(slug);
  if (!category) notFound();
  return <CatalogView category={category.slug} page={parsePage(page)} />;
}
