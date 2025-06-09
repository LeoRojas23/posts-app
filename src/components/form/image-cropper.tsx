'use client'

import { useRef, useState, useTransition } from 'react'
import Cropper, { Area } from 'react-easy-crop'
import { upload } from '@vercel/blob/client'

import Icon from '../icon'
import FormButton from '../button/form-button'

import { FileWithPreview } from '@/types'
import getCroppedImage from '@/utils/crop-image'

interface Props {
  file: FileWithPreview
  onApply: (url: string) => void
  from: 'post' | 'profile'
  clearStates: () => void
}

export default function ImageCropper({ file, onApply, from, clearStates }: Props) {
  const [isPending, startTransition] = useTransition()

  const [crop, setCrop] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const [zoom, setZoom] = useState(1)

  const croppedAreaData = useRef<Area | null>(null)

  const formAction = async () => {
    startTransition(async () => {
      try {
        const croppedImage = await getCroppedImage(file.preview, croppedAreaData.current!)

        const newBlob = await upload(file.name, croppedImage, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        })

        onApply(newBlob.url)
      } catch (error) {
        console.log(error)
      }
    })
  }

  const onCropComplete = (_: Area, croppedAreaPixels: Area) => {
    croppedAreaData.current = croppedAreaPixels
  }

  return (
    <div className='relative flex h-full w-full justify-center p-1'>
      {isPending ? (
        <div className='pointer-events-auto absolute inset-0 z-10 bg-transparent' />
      ) : null}

      <Cropper
        aspect={from === 'post' ? 4 / 3 : 1}
        crop={crop}
        image={file.preview}
        showGrid={false}
        zoom={zoom}
        onCropChange={setCrop}
        onCropComplete={onCropComplete}
        onZoomChange={setZoom}
      />

      <button
        className='absolute top-1 left-1 cursor-pointer rounded-full bg-[#a50f0f] p-1 transition-opacity duration-100 ease-linear hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 sm:p-1.5'
        disabled={isPending}
        type='button'
        onClick={clearStates}
      >
        <Icon className='h-5 w-5 text-[#fff1f1]' id='close' />
      </button>

      <FormButton
        className='absolute top-1 right-1 rounded-full bg-[#00b4f1] p-1 font-medium text-[#0d0d0d] transition-opacity duration-100 ease-linear hover:opacity-80 sm:p-1.5'
        pending={isPending}
        type='button'
        onClick={formAction}
      >
        Apply
      </FormButton>
    </div>
  )
}
