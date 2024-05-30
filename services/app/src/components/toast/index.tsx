import toast from 'react-hot-toast';
import { BiErrorCircle } from 'react-icons/bi';
import { LuCheck } from 'react-icons/lu';

export const successToast = (message: string) => {
    toast.custom(
        (t) => (
            <div
                className={`${
                    t.visible ? 'animate-enter' : 'animate-leave'
                } min-w-80 bg-emerald-500 text-white shadow-lg rounded-lg pointer-events-auto border-emerald-800 flex ring-1 ring-transparent`}
            >
                <div className="flex p-4">
                    <LuCheck className="size-6 mr-2" />
                    {message}
                </div>
            </div>
        ),
        {
            position: 'bottom-center'
        }
    );
};

export const errorToast = (message: string) => {
    toast.custom(
        (t) => (
            <div
                className={`${
                    t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-80 bg-red-600 text-white w-full shadow-lg rounded-lg pointer-events-auto border-emerald-800 flex ring-1 ring-transparent`}
            >
                <div className="flex p-4">
                    <BiErrorCircle className="size-6 mr-2" />
                    {message}
                </div>
            </div>
        ),
        {
            position: 'bottom-center'
        }
    );
};
