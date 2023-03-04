import { BaseModal } from './BaseModal'

type Props = {
  isOpen: boolean
  handleClose: () => void
}

export const InfoModal = ({ isOpen, handleClose }: Props) => {
  return (
    <BaseModal title="How to play" isOpen={isOpen} handleClose={handleClose}>
      <p className="text-sm text-gray-500 dark:text-gray-300">
        Guess the name of the movie quoted in 3 tries. If you get it right you get a chance to 
        answer two additional questions about the quoted film. You only
        get 3 tries for each question so if you can't answer in those 3 tries 
        you'll have to wait until tomorrow to play again.<br></br><br></br>
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-300">Answers do not need to be case sensative.<br></br>
      </p>

      <p className="mt-6 text-sm italic text-gray-500 dark:text-gray-300">
        <a
          href="https://github.com/wutangdev/flickle"
          className="font-bold underline"
        >
          Check out the repo for this project here.
        </a>
        <br></br>
      </p>
    </BaseModal>
  )
}
