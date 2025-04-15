'use client'

import { useActionState, useRef, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import ImageCropper from './image-cropper'

import { updateSettings } from '@/actions/actions'
import { UpdateSettingsResponse, type FileWithPreview } from '@/types'
import SubmitFormButton from '@/components/button/submit-form-button'
import Icon from '@/components/icon'
import { STEPS_IMAGE_UPLOAD } from '@/utils/utils'
import { ImageSchema } from '@/validations/image'
import { cn } from '@/utils/cn'

interface Props {
  sessionName: string
  sessionUsername: string
}

const initialState: UpdateSettingsResponse = {
  success: false,
  message: '',
}

export default function FormUpdateSettings({ sessionName, sessionUsername }: Props) {
  const [file, setFile] = useState<FileWithPreview | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<
    (typeof STEPS_IMAGE_UPLOAD)[keyof typeof STEPS_IMAGE_UPLOAD]
  >(STEPS_IMAGE_UPLOAD.READY)

  const ref = useRef<HTMLFormElement | null>(null)

  const [state, formAction, pending] = useActionState(
    async (status: UpdateSettingsResponse, formData: FormData) => {
      const name = (formData.get('name') as string) || undefined
      const username = (formData.get('username') as string) || undefined

      const result = await updateSettings({ name, username, image: uploadedImageUrl })

      if (!result.success) {
        toast.error(result.message)

        return result
      }

      setFile(null)
      setUploadedImageUrl(null)
      setCurrentStep(STEPS_IMAGE_UPLOAD.READY)

      return result
    },
    initialState,
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFile = e.target.files?.[0]

    if (inputFile) {
      try {
        await ImageSchema.parseAsync(inputFile)

        const fileData = Object.assign(inputFile, { preview: URL.createObjectURL(inputFile) })

        setFile(fileData)
        setCurrentStep(STEPS_IMAGE_UPLOAD.CROP)
      } catch (error) {
        if (error instanceof z.ZodError) {
          let errorMessage = ''

          error.issues.forEach(issue => {
            errorMessage += issue.message + '. '
          })

          toast.error(errorMessage)

          e.target.value = ''
          setFile(null)
          setCurrentStep(STEPS_IMAGE_UPLOAD.READY)
        }
      }
    }
  }

  return (
    <form
      ref={ref}
      action={formAction}
      className='flex h-full w-full max-w-xl flex-col items-start justify-between'
    >
      <section className='mt-1 flex h-full w-full items-start justify-center'>
        {!file && currentStep === STEPS_IMAGE_UPLOAD.READY && (
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
        )}
        {file && currentStep === STEPS_IMAGE_UPLOAD.CROP ? (
          <ImageCropper
            file={file}
            from='profile'
            onApply={async blob => {
              const formData = new FormData()
              const croppedFile = new File([blob], file.name || 'cropped-image', {
                type: blob.type,
              })

              formData.append('profileImage', croppedFile)
              formData.append('from', 'profile')

              try {
                const response = await fetch('/api/file', {
                  method: 'POST',
                  body: formData,
                })

                const result = await response.json()

                if (!response.ok || !result.url) {
                  throw new Error(result?.error)
                }

                setUploadedImageUrl(result.url)
                setCurrentStep(STEPS_IMAGE_UPLOAD.COMPLETED)
              } catch (error) {
                if (error instanceof Error) {
                  toast.error(error.message)
                }
              }
            }}
            onClose={() => {
              setFile(null)
              setUploadedImageUrl(null)
              setCurrentStep(STEPS_IMAGE_UPLOAD.READY)
            }}
          />
        ) : uploadedImageUrl && currentStep === STEPS_IMAGE_UPLOAD.COMPLETED ? (
          <div className='relative flex h-full w-full items-start justify-center'>
            <img
              alt={file?.name}
              className='max-h-full w-auto rounded-md border-2 border-neutral-800'
              src={uploadedImageUrl}
            />

            <button
              className='animate-fadeIn absolute left-1 top-1 rounded-full border-2 border-[#a50f0f] bg-[#26262690] p-1 transition-opacity duration-100 ease-linear hover:opacity-80 sm:p-1.5'
              type='button'
              onClick={() => {
                setFile(null)
                setUploadedImageUrl(null)
                setCurrentStep(STEPS_IMAGE_UPLOAD.READY)
              }}
            >
              <Icon className='h-5 w-5 text-[#fff1f1]' id='close' />
            </button>
          </div>
        ) : null}
      </section>

      <footer className='mx-auto mt-2 flex h-full w-full basis-1 flex-col items-start justify-end'>
        <div className='flex w-full flex-col items-start'>
          <label className='w-fit text-[15px] font-medium text-neutral-200' htmlFor='inputName'>
            Change your name
          </label>
          <input
            autoComplete='off'
            className='w-full rounded-lg border border-neutral-600 bg-neutral-900 py-1 pl-1 text-[15px] text-neutral-200 placeholder-neutral-400 outline-none transition-colors duration-100 ease-linear focus:border-neutral-400'
            defaultValue={state.payload?.name}
            id='inputName'
            name='name'
            placeholder={sessionName!}
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
              defaultValue={state.payload?.username}
              id='inputUsername'
              name='username'
              placeholder={sessionUsername}
              type='text'
            />
          </div>
        </div>

        <SubmitFormButton
          className={cn(
            'mx-auto my-2 w-fit rounded-md bg-[#00b4f1] px-2 py-1 font-bold text-[#0d0d0d] transition-opacity duration-100 ease-linear hover:opacity-90 sm:px-3 sm:py-1.5',
            {
              'pointer-events-none opacity-40': currentStep === STEPS_IMAGE_UPLOAD.CROP,
            },
          )}
          disabled={currentStep === STEPS_IMAGE_UPLOAD.CROP}
          pending={pending}
        >
          Save
        </SubmitFormButton>
      </footer>
    </form>
  )
}
