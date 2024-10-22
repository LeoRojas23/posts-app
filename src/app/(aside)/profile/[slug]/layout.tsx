import Nav from '@/components/profile/nav'

interface Props {
  children: React.ReactNode
  params: { slug: string }
}

export default function ProfileLayout({ children, params }: Props) {
  const { slug } = params

  return (
    <section className='h-full w-full px-[1px] lg:px-0'>
      <Nav slug={slug} />
      {children}
    </section>
  )
}
