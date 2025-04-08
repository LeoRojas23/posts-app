import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='mt-2 flex flex-col items-center justify-start'>
      <h1 className='text-base tracking-wide text-neutral-300'>Page not found</h1>
      <section className='mt-4 flex items-center justify-center'>
        <Link
          className='rounded-full bg-[#00b4f1] px-1.5 py-1 font-semibold text-[#0d0d0d] transition-opacity duration-100 ease-linear hover:opacity-90'
          href='/'
        >
          Go home
        </Link>
      </section>
    </div>
  )
}
