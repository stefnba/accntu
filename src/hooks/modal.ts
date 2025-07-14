import { parseAsStringLiteral, useQueryState } from 'nuqs';

interface ModalOptions<T extends readonly string[]> {
    key?: string;
    views: T;
    defaultView?: T[number];
}

/**
 * A hook to manage a modal.
 * @param key - The key to use for the modal view.
 * @param views - The views to use for the modal, e.g. create, update, etc.
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
    };

    /**
     * Close the modal.
     */
    const close = () => {
        _setModalView(null);
    };

    /**
     * Toggle the modal open state.
     */
    const toggleModalOpen = () => {
        _setModalView(modalView ? null : options.defaultView || options.views[0]);
    };

    /**
     * Reset the modal view to the default view.
     */
    const resetModalView = () => {
        _setModalView(options.defaultView || options.views[0]);
    };

    /**
     * Set the modal view to a specific view.
     * @param view - The view to set.
     */
    const setModalView = (view: T[number]) => {
        _setModalView(view);
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
    pages: T;
    initialPage?: T[number];
}

/**
 * A hook to manage a step modal.
 * @param key - The key to use for the step modal.
 * @param pages - The pages to use for the step modal, e.g. step1, step2, etc.
 * @param initialPage - The initial page to use for the step modal.
 * @returns An object with the current page, reset function, setPage function, and pages array.
 */
export const useStepModal = <T extends readonly string[]>(options: StepModalOptions<T>) => {
    const [page, _setPage] = useQueryState<T[number]>(
        options.key || 'p',
        parseAsStringLiteral(options.pages)
    );

    const setPage = (page: T[number]) => {
        _setPage(page);
    };

    const resetPage = () => {
        _setPage(options.initialPage || options.pages[0]);
    };

    return {
        page,
        resetPage,
        setPage,
        pages: options.pages,
    };
};

export type InferQueryStateStepModalPageOptions<
    T extends (...args: any[]) => { pages: readonly string[] },
> = ReturnType<T>['pages'][number];
