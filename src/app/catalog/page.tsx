import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CatalogSkeleton, CatalogView } from '@/features/catalog/components/catalog-view';
import { parsePage } from '@/lib/pagination';

export const metadata: Metadata = {
  title: 'Catalogue',
  description: 'Kava, botanical and functional beverages, shots, raw goods and extracts.',
};

export default function CatalogPage({ searchParams }: PageProps<'/catalog'>) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      {searchParams.then(({ page }) => (
        <CatalogView category={null} page={parsePage(page)} />
      ))}
    </Suspense>
  );
}
