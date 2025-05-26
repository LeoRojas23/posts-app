'use client'

import { useRef, useState } from 'react'
import Cropper, { Area } from 'react-easy-crop'

import Icon from '../icon'

import { FileWithPreview } from '@/types'
import getCroppedImage from '@/utils/crop-image'

interface Props {
  file: FileWithPreview
  onClose: () => void
  onApply: (url: string) => void
  from: 'post' | 'profile'
}

export default function ImageCropper({ file, onClose, onApply, from }: Props) {
  const [crop, setCrop] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const [zoom, setZoom] = useState(1)

  const croppedAreaData = useRef<Area | null>(null)

  const onCropComplete = (_: Area, croppedAreaPixels: Area) => {
    croppedAreaData.current = croppedAreaPixels
  }

  const onSubmit = async () => {
    try {
      const croppedImage = await getCroppedImage(file.preview, croppedAreaData.current!)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='relative flex h-full w-full justify-center p-1'>
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
        className='absolute top-1 left-1 cursor-pointer rounded-full border-2 border-[#a50f0f] bg-[#26262690] p-1 transition-opacity duration-100 ease-linear hover:opacity-80 sm:p-1.5'
        type='button'
        onClick={onClose}
      >
        <Icon className='h-5 w-5 text-[#fff1f1]' id='close' />
      </button>

      <button
        className='absolute top-1 right-1 cursor-pointer rounded-full bg-[#00b4f1] p-1 font-medium text-[#0d0d0d] transition-opacity duration-100 ease-linear hover:opacity-80 sm:p-1.5'
        type='button'
        onClick={onSubmit}
      >
        Apply
      </button>
    </div>
  )
}
