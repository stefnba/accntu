import { parseAsStringLiteral, useQueryState } from 'nuqs';

interface ModalOptions<T extends readonly string[]> {
    key?: string;
    views: T;
    defaultView?: T[number];
    onOpen?: (view: T[number]) => void;
    onClose?: () => void;
}

/**
 * A hook to manage a modal.
 * @param key - The key to use for the modal view.
 * @param views - The views to use for the modal, e.g. create, update, etc.
 * @param onOpen - Optional callback when modal opens
 * @param onClose - Optional callback when modal closes
 * @returns An object with the modal view, open function, and close function.
 */
export const useQueryStateModal = <T extends readonly string[]>(options: ModalOptions<T>) => {
    const [modalView, _setModalView] = useQueryState<T[number]>(
        options.key || 'v',
        parseAsStringLiteral(options.views)
    );

    /**
     * Open the modal with a specific view.
     */
    const open = (type: T[number]) => {
        _setModalView(type);
        options.onOpen?.(type);
    };

    /**
     * Close the modal.
     */
    const close = () => {
        _setModalView(null);
        options.onClose?.();
    };

    /**
     * Toggle the modal open state.
     */
    const toggleModalOpen = () => {
        if (modalView) {
            close();
        } else {
            const defaultView = options.defaultView || options.views[0];
            open(defaultView);
        }
    };

    /**
     * Reset the modal view to the default view.
     */
    const resetModalView = () => {
        const defaultView = options.defaultView || options.views[0];
        open(defaultView);
    };

    /**
     * Set the modal view to a specific view.
     * @param view - The view to set.
     */
    const setModalView = (view: T[number]) => {
        open(view);
    };

    return {
        isModalOpen: !!modalView,
        toggleModalOpen,
        resetModalView,
        modalView,
        openModal: open,
        setModalView,
        closeModal: close,
        views: options.views,
    };
};

/**
 * Utility type to infer literal union type from modal views array
 */
export type InferQueryStateModalViewOptions<
    T extends (...args: any[]) => { views: readonly string[] },
> = ReturnType<T>['views'][number];

interface StepModalOptions<T extends readonly string[]> {
    key?: string;
    steps: T;
    initialStep?: T[number];
}

/**
 * A hook to manage a step modal.
 * @param key - The key to use for the step modal.
 * @param steps - The steps to use for the step modal, e.g. step1, step2, etc.
 * @param initialStep - The initial step to use for the step modal.
 * @returns An object with the current step, reset function, setStep function, and steps array.
 */
export const useStepModal = <T extends readonly string[]>(options: StepModalOptions<T>) => {
    const [step, _setStep] = useQueryState<T[number]>(
        options.key || 'p',
        parseAsStringLiteral(options.steps).withDefault(options.initialStep || options.steps[0])
    );

    const setStep = (step: T[number]) => {
        _setStep(step);
    };

    const resetStep = () => {
        _setStep(options.initialStep || options.steps[0]);
    };

    return {
        step,
        resetStep,
        setStep,
        steps: options.steps,
    };
};

export type InferQueryStateStepModalStepOptions<
    T extends (...args: any[]) => { steps: readonly string[] },
> = ReturnType<T>['steps'][number];
