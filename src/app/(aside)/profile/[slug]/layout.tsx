import Nav from '@/components/profile/nav'

interface Props {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function ProfileLayout({ children, params }: Props) {
  const { slug } = await params

  return (
    <section className='h-full w-full px-[1px] lg:px-0'>
      <Nav slug={slug} />
      {children}
    </section>
  )
}
