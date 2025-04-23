import Aside from '@/components/aside/aside'

export default function AsideLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className='h-full w-full sm:grid sm:grid-cols-[80px_1fr] lg:grid-cols-[220px_1fr]'>
      <Aside />
      {children}
    </section>
  )
}
