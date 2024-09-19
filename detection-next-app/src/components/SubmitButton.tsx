import { MouseEventHandler } from "react";

interface SubmitProps {
    type?: 'submit' | 'button',
    title: String,
    class_name?: string,
    btnLoading?: Boolean,
    callback_event?: MouseEventHandler<HTMLButtonElement>
}

export const SubmitButton = ({ type = 'submit', title, class_name = 'bg-blue-500 hover:bg-blue-700 text-white font-bold rounded py-2 px-4', callback_event, btnLoading }: SubmitProps) => (
    <button
        type={type}
        onClick={callback_event}
        className={class_name}
    >
        {btnLoading &&
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>}       
        {btnLoading ? 'Processing...' : title}
    </button>
);


export default SubmitButton