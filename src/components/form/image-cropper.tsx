'use client'

import 'cropperjs/dist/cropper.css'

import { createRef } from 'react'
import Cropper, { ReactCropperElement } from 'react-cropper'

import Icon from '../icon'

import { FileWithPreview } from '@/types'

const maxWidth = 740
const maxHeight = 480

const getCroppedImageBlob = (
  cropperRef: React.RefObject<ReactCropperElement>,
  mimeType: string,
): Promise<Blob | null> => {
  return new Promise(resolve => {
    const cropper = cropperRef.current?.cropper

    if (typeof cropper !== 'undefined') {
      cropper
        .getCroppedCanvas({
          maxHeight,
          maxWidth,
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

interface Props {
  file: FileWithPreview
  onApply: (blob: Blob) => void
  onClose: () => void
}

export default function ImageCropper({ file, onApply, onClose }: Props) {
  const cropperRef = createRef<ReactCropperElement>()

  const onCropMove = () => {
    const cropper = cropperRef.current?.cropper

    if (typeof cropper !== 'undefined') {
      const cropBoxData = cropper.getCropBoxData()

      if (cropBoxData.width > maxWidth) {
        cropper.setCropBoxData({ width: maxWidth })
      }
      if (cropBoxData.height > maxHeight) {
        cropper.setCropBoxData({ height: maxHeight })
      }
    }
  }

  const onReady = () => {
    const cropper = cropperRef.current?.cropper

    if (typeof cropper !== 'undefined') {
      cropper.zoom(-1)
    }
  }

  const handleApply = async () => {
    const blob = await getCroppedImageBlob(cropperRef, file.type || 'image/jpeg')

    if (!blob) {
      console.error('Error generating cropped image')

      return
    }

    onApply(blob)
  }

  return (
    <div className='relative w-full overflow-hidden p-1'>
      <Cropper
        ref={cropperRef}
        responsive
        background={false}
        center={false}
        checkOrientation={false}
        className='h-full max-h-[620px] w-full'
        cropmove={onCropMove}
        dragMode='move'
        guides={false}
        minCropBoxHeight={20}
        minCropBoxWidth={20}
        ready={onReady}
        rotatable={false}
        scalable={false}
        src={file.preview}
        toggleDragModeOnDblclick={false}
        viewMode={2}
      />

      <button
        className='animate-fadeIn absolute left-1 top-1 rounded-full border-2 border-[#a50f0f] bg-[#26262690] p-1 transition-opacity duration-100 ease-linear hover:opacity-80 sm:p-1.5'
        type='button'
        onClick={onClose}
      >
        <Icon className='h-5 w-5 text-[#fff1f1]' id='close' />
      </button>

      <button
        className='animate-fadeIn absolute right-1 top-1 rounded-full bg-[#00b4f1] p-1 font-medium text-[#0d0d0d] sm:p-1.5'
        type='button'
        onClick={handleApply}
      >
        Apply
      </button>
    </div>
  )
}
