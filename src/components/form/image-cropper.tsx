'use client'

import 'react-image-crop/dist/ReactCrop.css'

import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
  type Crop,
} from 'react-image-crop'
import { useActionState, useRef, useState } from 'react'

import Icon from '../icon'
import SubmitFormButton from '../button/submit-form-button'

import { FileWithPreview } from '@/types'
import { generateCroppedImageBlob } from '@/utils/generate-cropper-image-blob'

const DIMENSIONS = {
  post: {
    MAX_WIDTH: 740,
    MAX_HEIGHT: 480,
    MIN_WIDTH: 120,
    MIN_HEIGHT: 120,
  },
  profile: {
    MAX_WIDTH: 300,
    MAX_HEIGHT: 300,
    MIN_WIDTH: 200,
    MIN_HEIGHT: 200,
  },
}

interface Props {
  file: FileWithPreview
  onApply: (blob: Blob) => void
  onClose: () => void
  from: 'post' | 'profile'
}

export default function ImageCropper({ file, onApply, onClose, from }: Props) {
  const [crop, setCrop] = useState<Crop>()
  const imgRef = useRef<HTMLImageElement>(null)

  const [, formAction, pending] = useActionState(async () => {
    if (!crop || !imgRef.current) return

    const blob = await generateCroppedImageBlob(
      imgRef.current,
      convertToPixelCrop(crop, imgRef.current?.width, imgRef.current?.height),
      file,
    )

    onApply(blob!)
  }, null)

  const { MAX_HEIGHT, MAX_WIDTH, MIN_HEIGHT, MIN_WIDTH } = DIMENSIONS[from]

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const { width, height } = e.currentTarget

    const cropWidthInPercent = (MIN_WIDTH / width) * 100

    const crop = makeAspectCrop(
      {
        unit: '%',
        width: cropWidthInPercent,
      },
      1,
      width,
      height,
    )

    const centeredCrop = centerCrop(crop, width, height)

    setCrop(centeredCrop)
  }

  return (
    <div className='relative flex w-full justify-center p-1'>
      <ReactCrop
        keepSelection
        className='max-h-[40rem]'
        crop={crop}
        maxHeight={MAX_HEIGHT}
        maxWidth={MAX_WIDTH}
        minHeight={MIN_HEIGHT}
        minWidth={MIN_WIDTH}
        onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
      >
        <img ref={imgRef} alt={file.name} src={file.preview} onLoad={onImageLoad} />
      </ReactCrop>

      <button
        className='absolute left-1 top-1 rounded-full border-2 border-[#a50f0f] bg-[#26262690] p-1 transition-opacity duration-100 ease-linear hover:opacity-80 sm:p-1.5'
        type='button'
        onClick={onClose}
      >
        <Icon className='h-5 w-5 text-[#fff1f1]' id='close' />
      </button>

      <SubmitFormButton
        className='absolute right-1 top-1 rounded-full bg-[#00b4f1] p-1 font-medium text-[#0d0d0d] transition-opacity duration-100 ease-linear hover:opacity-80 sm:p-1.5'
        formAction={formAction}
        pending={pending}
      >
        Apply
      </SubmitFormButton>
    </div>
  )
}
