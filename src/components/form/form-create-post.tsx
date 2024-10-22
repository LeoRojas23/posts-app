'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'

import Icon from '../icon'
import SubmitFormButton from '../button/submit-form-button'

import ApplyFilter from './apply-filter'
import ImageCropper from './image-cropper'

import { type SessionAuth, type FileWithPreview } from '@/types'
import { cn } from '@/utils/cn'
import { createPost, processAndUploadImage } from '@/actions/actions'
import { PostImageSchema } from '@/validations/create-post'
import { STEPS_FORM_CREATE_POST } from '@/utils/utils'

export default function FormCreatePost({ session }: { session: SessionAuth | null }) {
  const [currentStep, setCurrentStep] = useState<
    (typeof STEPS_FORM_CREATE_POST)[keyof typeof STEPS_FORM_CREATE_POST]
  >(STEPS_FORM_CREATE_POST.TEXT)
  const [file, setFile] = useState<FileWithPreview | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isImageLoading, setIsImageLoading] = useState(true)
  const ref = useRef<HTMLFormElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFile = e.target.files?.[0]

    if (inputFile) {
      const result = PostImageSchema.safeParse(inputFile)

      if (!result.success) {
        let errorMessage = ''

        result.error.issues.forEach(error => {
          errorMessage = errorMessage + error.message + '. '
        })

        toast.error(errorMessage)
        e.target.value = ''
        setFile(null)

        return
      }

      const fileData = Object.assign(inputFile, { preview: URL.createObjectURL(inputFile) })

      setFile(fileData)
      setCurrentStep(STEPS_FORM_CREATE_POST.CROP)
    }
  }

  const formAction = async (formData: FormData) => {
    if (!session) {
      toast.error('Authentication required.')

      return
    }

    const result = await createPost(formData, uploadedImageUrl)

    ref.current?.reset()
    setFile(null)
    setUploadedImageUrl(null)
    setCurrentStep(STEPS_FORM_CREATE_POST.TEXT)

    if (result?.error) {
      toast.error(result.error)

      return
    }
  }

  const updateIsImageLoading = (value: boolean) => {
    setIsImageLoading(value)
  }

  const updateUploadedImageUrl = (value: string) => {
    setUploadedImageUrl(value)
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
        className='h-20 w-full resize-none border-b border-b-neutral-700 bg-transparent px-2 py-2 text-neutral-200 outline-none'
        id='textareaPost'
        name='postText'
        placeholder='Put something'
      />
      <section
        className={cn({
          'px-2 pb-1.5': file,
        })}
      >
        {file && currentStep === STEPS_FORM_CREATE_POST.CROP ? (
          <ImageCropper
            file={file}
            onApply={async blob => {
              try {
                const formData = new FormData()
                const croppedFile = new File([blob], file.name || 'cropped-image', {
                  type: blob.type,
                })

                formData.append('postImage', croppedFile)

                const result = await processAndUploadImage(formData)

                if (!result?.url) {
                  throw new Error(result?.error)
                }

                setUploadedImageUrl(result.url)
                setCurrentStep(STEPS_FORM_CREATE_POST.APPLY_FILTER)
              } catch (error) {
                console.log(error)
              }
            }}
            onClose={() => {
              setFile(null)
              setCurrentStep(STEPS_FORM_CREATE_POST.TEXT)
            }}
          />
        ) : uploadedImageUrl && currentStep !== STEPS_FORM_CREATE_POST.CROP ? (
          <div className='relative flex h-[480px] w-full items-center justify-center'>
            <img
              alt={file?.name}
              className={cn('h-auto w-auto', {
                'animate-pulse opacity-10 blur-sm': isImageLoading,
                'opacity-100': !isImageLoading,
              })}
              src={uploadedImageUrl}
              onError={() => {
                toast.error('Error while loading image, try again')
                setIsImageLoading(false)
              }}
              onLoad={() => setIsImageLoading(false)}
            />

            <button
              className='animate-fadeIn absolute left-1 top-1 rounded-full border-2 border-[#a50f0f] bg-[#26262690] p-1 transition-opacity duration-100 ease-linear hover:opacity-80 sm:p-1.5'
              type='button'
              onClick={() => {
                setUploadedImageUrl(null)
                setFile(null)
                setCurrentStep(STEPS_FORM_CREATE_POST.TEXT)
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
          disabled={
            !session ||
            currentStep === STEPS_FORM_CREATE_POST.APPLY_FILTER ||
            currentStep === STEPS_FORM_CREATE_POST.COMPLETED
          }
          id='postInputFile'
          type='file'
          onChange={handleFileChange}
        />

        <label
          className={cn('flex h-full cursor-pointer items-center justify-center', {
            'pointer-events-none opacity-40':
              !session ||
              currentStep === STEPS_FORM_CREATE_POST.APPLY_FILTER ||
              currentStep === STEPS_FORM_CREATE_POST.COMPLETED,
          })}
          htmlFor='postInputFile'
        >
          <Icon
            className='h-7 w-7 text-neutral-200 transition-colors duration-100 ease-linear hover:text-[#e7ffe4]'
            id='selectImagePost'
          />
          <span className='sr-only'>Upload an image</span>
        </label>

        <ApplyFilter
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          updateIsImageLoading={updateIsImageLoading}
          updateUploadedImageUrl={updateUploadedImageUrl}
          uploadedImageUrl={uploadedImageUrl}
        />

        <SubmitFormButton
          className={cn(
            'w-16 rounded-md bg-[#00ff00] font-bold text-[#0d0d0d] transition-opacity duration-100 ease-linear hover:opacity-80',
            {
              'pointer-events-none opacity-40': currentStep === STEPS_FORM_CREATE_POST.CROP,
            },
          )}
          disabled={currentStep === STEPS_FORM_CREATE_POST.CROP}
        >
          Send
        </SubmitFormButton>
      </section>
    </form>
  )
}
