import { applyFilterToImage } from '@/actions/actions'
import { cn } from '@/utils/cn'
import { MainOptionKeys, STEPS_FORM_CREATE_POST } from '@/utils/utils'

const filterOptions: { value: MainOptionKeys; label: string }[] = [
  { value: 'zombie', label: 'Zombie Mode' },
  { value: 'vampire', label: 'Vampire Look' },
  { value: 'terrifying', label: 'Terrifying Place' },
  { value: 'clown', label: 'Creepy Clown' },
]

interface Props {
  uploadedImageUrl: string | null
  currentStep: (typeof STEPS_FORM_CREATE_POST)[keyof typeof STEPS_FORM_CREATE_POST]
  updateIsImageLoading: (value: boolean) => void
  updateCurrentStep: (
    step: (typeof STEPS_FORM_CREATE_POST)[keyof typeof STEPS_FORM_CREATE_POST],
  ) => void
  updateUploadedImageFilteredUrl: (value: string) => void
}

export default function ApplyFilter({
  uploadedImageUrl,
  currentStep,
  updateIsImageLoading,
  updateCurrentStep,
  updateUploadedImageFilteredUrl,
}: Props) {
  const applyImageFilter = async (filterValue: MainOptionKeys) => {
    if (!uploadedImageUrl) return

    updateIsImageLoading(true)

    try {
      const newUrl = await applyFilterToImage(uploadedImageUrl, filterValue)

      updateUploadedImageFilteredUrl(newUrl)
      updateCurrentStep(STEPS_FORM_CREATE_POST.APLYING_FILTER)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      {uploadedImageUrl && currentStep !== STEPS_FORM_CREATE_POST.CROP ? (
        <div className='w-full'>
          <div className='mx-auto flex w-fit sm:hidden'>
            <select
              className={cn(
                'w-full rounded-md border border-[#0d0d0d] bg-[#00b809] p-1 font-medium text-[#0d0d0d] outline-none transition-all duration-100 ease-linear focus:border-[#4A9E4D] focus:ring-1 focus:ring-[#4A9E4D]',
                {
                  'cursor-not-allowed opacity-40': currentStep === STEPS_FORM_CREATE_POST.COMPLETED,
                },
              )}
              defaultValue='default'
              disabled={currentStep === STEPS_FORM_CREATE_POST.COMPLETED}
              onChange={e => {
                applyImageFilter(e.target.value as MainOptionKeys)
              }}
            >
              <option className='text-sm font-medium' value='default'>
                Choose a filter
              </option>
              {/* <option disabled hidden className='text-sm font-medium' value=''>
                Choose a filter
              </option> */}
              {filterOptions.map(option => (
                <option key={option.value} className='text-sm font-medium' value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className='hidden h-full w-full items-center justify-around sm:flex'>
            {filterOptions.map(option => (
              <button
                key={option.value}
                className={cn(
                  'rounded-md bg-[#3d3d3d20] p-1 text-[#00e606] outline-none hover:opacity-80',
                  {
                    'pointer-events-none opacity-40':
                      currentStep === STEPS_FORM_CREATE_POST.COMPLETED,
                  },
                )}
                disabled={currentStep === STEPS_FORM_CREATE_POST.COMPLETED}
                type='button'
                onClick={() => {
                  applyImageFilter(option.value)
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  )
}
