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
  >(STEPS_FORM_CREATE_POST.START)
  const [file, setFile] = useState<FileWithPreview | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [uploadedImageFilteredUrl, setUploadedImageFilteredUrl] = useState<string | null>(null)
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

    const imageUrlToUse = uploadedImageFilteredUrl ?? uploadedImageUrl

    const result = await createPost(formData, imageUrlToUse)

    ref.current?.reset()
    setFile(null)
    setUploadedImageUrl(null)
    setCurrentStep(STEPS_FORM_CREATE_POST.START)

    if (result?.error) {
      toast.error(result.error)

      return
    }
  }

  const updateIsImageLoading = (value: boolean) => {
    setIsImageLoading(value)
  }

  const updateCurrentStep = (
    value: (typeof STEPS_FORM_CREATE_POST)[keyof typeof STEPS_FORM_CREATE_POST],
  ) => {
    setCurrentStep(value)
  }

  const updateUploadedImageFilteredUrl = (value: string) => {
    setUploadedImageFilteredUrl(value)
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
              setCurrentStep(STEPS_FORM_CREATE_POST.START)
            }}
          />
        ) : uploadedImageFilteredUrl ? (
          <div className='relative flex h-[480px] w-full items-center justify-center'>
            <img
              alt={file?.name}
              className={cn('h-auto w-auto', {
                'animate-pulse opacity-10 blur-sm': isImageLoading,
                'opacity-100': !isImageLoading,
              })}
              src={uploadedImageFilteredUrl}
              onError={() => {
                toast.error('Error while loading filtered image, try again')
                setIsImageLoading(false)
                setCurrentStep(STEPS_FORM_CREATE_POST.START)
                setFile(null)
                setUploadedImageFilteredUrl(null)
                setUploadedImageUrl(null)
              }}
              onLoad={() => {
                setIsImageLoading(false)
                setCurrentStep(STEPS_FORM_CREATE_POST.COMPLETED)
              }}
            />

            <button
              className='animate-fadeIn absolute left-1 top-1 rounded-full border-2 border-[#a50f0f] bg-[#26262690] p-1 transition-opacity duration-100 ease-linear hover:opacity-80 sm:p-1.5'
              type='button'
              onClick={() => {
                setCurrentStep(STEPS_FORM_CREATE_POST.START)
                setFile(null)
                setUploadedImageUrl(null)
                setUploadedImageFilteredUrl(null)
                setIsImageLoading(true)
              }}
            >
              <Icon className='h-5 w-5 text-[#fff1f1]' id='close' />
            </button>
          </div>
        ) : uploadedImageUrl && currentStep !== STEPS_FORM_CREATE_POST.CROP ? (
          <div className='relative flex h-[480px] w-full items-center justify-center'>
            <img alt={file?.name} className='h-auto w-auto' src={uploadedImageUrl} />

            <button
              className='animate-fadeIn absolute left-1 top-1 rounded-full border-2 border-[#a50f0f] bg-[#26262690] p-1 transition-opacity duration-100 ease-linear hover:opacity-80 sm:p-1.5'
              type='button'
              onClick={() => {
                setCurrentStep(STEPS_FORM_CREATE_POST.START)
                setFile(null)
                setUploadedImageUrl(null)
                setUploadedImageFilteredUrl(null)
                setIsImageLoading(true)
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
            currentStep === STEPS_FORM_CREATE_POST.COMPLETED ||
            currentStep === STEPS_FORM_CREATE_POST.APLYING_FILTER
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
              currentStep === STEPS_FORM_CREATE_POST.COMPLETED ||
              currentStep === STEPS_FORM_CREATE_POST.APLYING_FILTER,
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
          updateCurrentStep={updateCurrentStep}
          updateIsImageLoading={updateIsImageLoading}
          updateUploadedImageFilteredUrl={updateUploadedImageFilteredUrl}
          uploadedImageUrl={uploadedImageUrl}
        />

        <SubmitFormButton
          className={cn(
            'w-16 rounded-md bg-[#00ff00] font-bold text-[#0d0d0d] transition-opacity duration-100 ease-linear hover:opacity-80',
            {
              'pointer-events-none opacity-40':
                currentStep === STEPS_FORM_CREATE_POST.CROP ||
                currentStep === STEPS_FORM_CREATE_POST.APLYING_FILTER,
            },
          )}
          disabled={
            currentStep === STEPS_FORM_CREATE_POST.CROP ||
            currentStep === STEPS_FORM_CREATE_POST.APLYING_FILTER
          }
        >
          Send
        </SubmitFormButton>
      </section>
    </form>
  )
}
