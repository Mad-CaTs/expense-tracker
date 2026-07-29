import { CategoryMovementsScreen } from '@/components/features/categories/CategoryMovementsScreen'

interface CategoryMovementsPageProps {
  params: Promise<{ id: string }>
}

export default async function CategoryMovementsPage({ params }: CategoryMovementsPageProps) {
  const { id } = await params

  return (
    <div className="mx-auto min-h-[100dvh] max-w-3xl">
      <CategoryMovementsScreen categoryId={Number(id)} />
    </div>
  )
}
