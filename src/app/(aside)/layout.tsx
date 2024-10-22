import Aside from '@/components/aside/aside'

export default function AsideLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className='h-full w-full sm:grid sm:grid-cols-[80px,1fr] lg:grid-cols-[220px,1fr]'>
      <Aside />
      {children}
    </section>
  )
}
