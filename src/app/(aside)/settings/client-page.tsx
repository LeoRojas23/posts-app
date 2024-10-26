'use client'

import 'cropperjs/dist/cropper.css'
import { createRef, useRef, useState } from 'react'
import { toast } from 'sonner'
import Cropper, { ReactCropperElement } from 'react-cropper'

import { updateSettings } from '@/actions/actions'
import { type UserAuth, type FileWithPreview } from '@/types'
import SubmitFormButton from '@/components/button/submit-form-button'
import { ProfileImageSchema } from '@/validations/update-settings'
import Icon from '@/components/icon'

interface Props {
  session: UserAuth | null
}

const cropSize = 399

const getCroppedImageBlob = (
  cropperRef: React.RefObject<ReactCropperElement>,
  mimeType: string,
): Promise<Blob | null> => {
  return new Promise(resolve => {
    const cropper = cropperRef.current?.cropper

    if (typeof cropper !== 'undefined') {
      cropper
        .getCroppedCanvas({
          width: cropSize,
          height: cropSize,
          imageSmoothingQuality: 'high',
        })
        .toBlob(
          blob => {
            resolve(blob)
          },
          mimeType,
          1,
        )
    } else {
      resolve(null)
    }
  })
}

export default function ClientPage({ session }: Props) {
  const [file, setFile] = useState<FileWithPreview | null>(null)
  const ref = useRef<HTMLFormElement | null>(null)

  const cropperRef = createRef<ReactCropperElement>()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFile = e.target.files?.[0]

    if (inputFile) {
      const result = ProfileImageSchema.safeParse(inputFile)

      if (!result.success) {
        let errorMessage = ''

        result.error.issues.forEach(issue => {
          errorMessage = errorMessage + issue.message + '. '
        })

        toast.error(errorMessage)
        e.target.value = ''
        setFile(null)

        return
      }

      const fileData = Object.assign(inputFile, { preview: URL.createObjectURL(inputFile) })

      setFile(fileData)
    }
  }

  const formAction = async (formData: FormData) => {
    if (!session) return

    const blob = await getCroppedImageBlob(cropperRef, file?.type || 'image/jpeg')

    if (blob) {
      const resizedImage = new File([blob], file?.name || 'resized-image', {
        type: blob.type,
      })

      formData.append('profileImage', resizedImage)
    }

    const result = await updateSettings(formData)

    ref.current?.reset()
    setFile(null)

    if (result?.error) {
      toast.error(result.error)

      return
    }
  }

  return (
    <form
      ref={ref}
      action={formAction}
      className='flex h-full w-full max-w-lg flex-col items-start justify-between'
    >
      <section className='mt-1 flex h-full w-full items-start justify-center'>
        {!file ? (
          <label
            className='flex h-64 w-full max-w-md cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-600 bg-neutral-900 transition-colors duration-100 ease-linear hover:border-neutral-400'
            htmlFor='fileInputZone'
          >
            <div className='flex flex-col items-center justify-center py-5'>
              <Icon className='mb-4 h-10 w-10 text-neutral-300' id='uploadImageProfile' />
              <p className='mb-2 text-center text-sm text-neutral-300 sm:text-base'>
                Update your profile image
              </p>
              <p className='text-center text-xs text-neutral-400 sm:text-sm'>
                JPEG, JPG, PNG, AVIF or WEBP (MAX 4.5MB)
              </p>
            </div>
            <input
              accept='.jpeg,.jpg,.png,.webp,.avif'
              aria-label='Update your profile image'
              className='sr-only'
              id='fileInputZone'
              type='file'
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className='relative w-full overflow-hidden p-1'>
            <Cropper
              ref={cropperRef}
              responsive
              aspectRatio={1}
              background={false}
              center={false}
              checkOrientation={false}
              className='h-[499px] w-full'
              cropBoxResizable={false}
              dragMode='move'
              guides={false}
              minCropBoxHeight={cropSize}
              minCropBoxWidth={300}
              rotatable={false}
              scalable={false}
              src={file.preview}
              toggleDragModeOnDblclick={false}
              viewMode={3}
            />
            <button
              className='animate-fadeIn group absolute right-1 top-1 rounded-full border-2 border-neutral-400 bg-neutral-800 px-1 py-1 transition-colors duration-100 ease-linear hover:bg-neutral-700 sm:px-1.5 sm:py-1.5'
              type='button'
              onClick={() => {
                setFile(null)
              }}
            >
              <Icon className='h-5 w-5 text-neutral-200' id='close' />
            </button>
          </div>
        )}
      </section>

      <footer className='mx-auto mt-2 flex h-full w-full basis-1 flex-col items-start justify-end'>
        <div className='flex w-full flex-col items-start'>
          <label className='w-fit text-[15px] font-medium text-neutral-200' htmlFor='inputName'>
            Change your name
          </label>
          <input
            autoComplete='off'
            className='w-full rounded-lg border border-neutral-600 bg-neutral-900 py-1 pl-1 text-[15px] text-neutral-200 placeholder-neutral-400 outline-none transition-colors duration-100 ease-linear focus:border-neutral-400'
            id='inputName'
            name='name'
            placeholder={session?.name}
            type='text'
          />
        </div>

        <div className='flex w-full flex-col items-start'>
          <label className='w-fit text-[15px] font-medium text-neutral-200' htmlFor='inputUsername'>
            Change your username
          </label>
          <div className='relative w-full'>
            <span className='pointer-events-none absolute inset-0 flex items-center pl-1 text-sm text-neutral-200'>
              @
            </span>
            <input
              autoComplete='off'
              className='w-full rounded-lg border border-neutral-600 bg-neutral-900 py-1 pl-[18px] text-[15px] text-neutral-200 placeholder-neutral-400 outline-none transition-colors duration-100 ease-linear focus:border-neutral-400'
              id='inputUsername'
              name='username'
              placeholder={session?.username}
              type='text'
            />
          </div>
        </div>

        <SubmitFormButton className='mx-auto my-2 w-20 rounded-md bg-[#00b4f1] font-bold text-[#0d0d0d] transition-opacity duration-100 ease-linear hover:opacity-90'>
          Save
        </SubmitFormButton>
      </footer>
    </form>
  )
}
