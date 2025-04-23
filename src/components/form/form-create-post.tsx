'use client'

import { useActionState, useRef, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import Icon from '../icon'
import SubmitFormButton from '../button/submit-form-button'

import ImageCropper from './image-cropper'

import { type CreatePostResponse, type FileWithPreview } from '@/types'
import { cn } from '@/utils/cn'
import { createPost } from '@/actions/actions'
import { STEPS_IMAGE_UPLOAD } from '@/utils/utils'
import { ImageSchema } from '@/validations/image'

const initialState: CreatePostResponse = {
  success: false,
  message: '',
}

export default function FormCreatePost({ session }: { session: boolean }) {
  const [file, setFile] = useState<FileWithPreview | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<
    (typeof STEPS_IMAGE_UPLOAD)[keyof typeof STEPS_IMAGE_UPLOAD]
  >(STEPS_IMAGE_UPLOAD.READY)

  const ref = useRef<HTMLFormElement | null>(null)

  const [state, formAction, pending] = useActionState(
    async (status: CreatePostResponse, formData: FormData) => {
      const text = (formData.get('postText') as string) || undefined

      const result = await createPost({ text, image: uploadedImageUrl })

      if (!result.success) {
        toast.error(result.message)

        return result
      }

      setFile(null)
      ref.current?.reset()
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
      className='my-2 h-fit w-full rounded-md border border-neutral-800'
    >
      <label className='sr-only' htmlFor='textareaPost'>
        Write your post
      </label>
      <textarea
        className='h-20 w-full resize-none border-b border-b-neutral-700 bg-transparent px-2 py-2 text-neutral-200 outline-hidden'
        defaultValue={state.payload}
        id='textareaPost'
        name='postText'
        placeholder='Put something'
        onKeyDown={e => {
          if (
            currentStep !== STEPS_IMAGE_UPLOAD.CROP &&
            (e.ctrlKey || e.metaKey) &&
            (e.key === 'Enter' || e.key === 'NumpadEnter')
          ) {
            e.preventDefault()
            e.currentTarget.form?.requestSubmit()
          }
        }}
      />
      <section
        className={cn({
          'px-2 pb-1.5': file,
        })}
      >
        {file && currentStep === STEPS_IMAGE_UPLOAD.CROP ? (
          <ImageCropper
            file={file}
            from='post'
            onApply={async blob => {
              const formData = new FormData()
              const croppedFile = new File([blob], file.name || 'cropped-image', {
                type: blob.type,
              })

              formData.append('postImage', croppedFile)
              formData.append('from', 'post')

              try {
                const response = await fetch('/api/file', {
                  method: 'POST',
                  body: formData,
                })

                const result = await response.json()

                if (!response.ok || !result.url) {
                  throw new Error(
                    result?.error || 'Image upload failed. Try again or reload the page.',
                  )
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
          <div className='relative flex h-[480px] w-full items-center justify-center'>
            <img alt={file?.name} className='max-h-full w-auto' src={uploadedImageUrl} />

            <button
              className='animate-fadeIn absolute top-1 left-1 rounded-full border-2 border-[#a50f0f] bg-[#26262690] p-1 transition-opacity duration-100 ease-linear hover:opacity-80 sm:p-1.5'
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
      <section className='flex h-fit items-center justify-between px-1 pb-1.5'>
        <input
          accept='.jpeg,.jpg,.png,.webp,.avif'
          className='sr-only'
          disabled={!session || currentStep === STEPS_IMAGE_UPLOAD.COMPLETED}
          id='postInputFile'
          type='file'
          onChange={handleFileChange}
        />

        <label
          className={cn('flex h-full cursor-pointer items-center justify-center', {
            'pointer-events-none opacity-40':
              !session || currentStep === STEPS_IMAGE_UPLOAD.COMPLETED,
          })}
          htmlFor='postInputFile'
        >
          <Icon
            className='h-7 w-7 text-neutral-200 transition-colors duration-100 ease-linear hover:text-[#b6ebff]'
            id='selectImagePost'
          />
          <span className='sr-only'>Upload an image</span>
        </label>

        <SubmitFormButton
          className={cn(
            'rounded-md bg-[#00b4f1] px-2 py-1 font-bold text-[#0d0d0d] transition-opacity duration-100 ease-linear hover:opacity-80 sm:px-3 sm:py-1.5',
            {
              'pointer-events-none opacity-40': currentStep === STEPS_IMAGE_UPLOAD.CROP,
            },
          )}
          disabled={currentStep === STEPS_IMAGE_UPLOAD.CROP}
          pending={pending}
        >
          Send
        </SubmitFormButton>
      </section>
    </form>
  )
}
