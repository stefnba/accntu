'use client';

import { parseAsStringLiteral, useQueryState } from 'nuqs';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';

/**
 * Configuration options for the responsive modal hook.
 * @template T - Array of view names as readonly string literals
 */
interface ModalOptions<T extends readonly string[]> {
    /** URL query parameter key for the modal state (e.g., 'profile-update' becomes ?profile-update=name). If provided, uses URL state; if omitted, uses local state. */
    key?: string;
    /** Array of view names. If omitted, defaults to ['show'] for simple single-view modals */
    readonly views?: T;
    /** Default view to open when no specific view is provided. Defaults to first view in array */
    defaultView?: T[number];
    /** Callback fired when modal opens with the view name that was opened */
    onOpen?: (view: T[number]) => void;
    /** Callback fired when modal closes */
    onClose?: () => void;
}

/**
 * Return type from useResponsiveModal hook.
 * @template T - Array of view names as readonly string literals
 */
interface ModalReturn<T extends readonly string[]> {
    /** Whether the modal is currently open (true if view has any value) */
    isOpen: boolean;
    /** Current view name, or null if modal is closed */
    view: T[number] | null;
    /** Opens the modal with optional view name (defaults to defaultView) */
    open: (view?: T[number]) => void;
    /** Closes the modal and clears the URL parameter */
    close: () => void;
    /** Changes to a different view while keeping modal open */
    setView: (view: T[number]) => void;
    /** Resets view to the default view */
    resetView: () => void;
    /** Toggles modal between open (with default view) and closed */
    toggle: () => void;
    /** Helper component for conditional rendering based on current view */
    View: (props: { name: T[number] | null; children: ReactNode }) => ReactNode;
}

/**
 * A hook for managing responsive modal state with URL query parameters or local state.
 *
 * This hook automatically chooses between URL state and local state based on the `key` option:
 * - **With key**: Uses URL state (nuqs) for shareable links and persistent state
 * - **Without key**: Uses local state (useState) for transient UI
 *
 * Features:
 * - Support multiple views within a single modal
 * - Handle view transitions without modal flickering
 * - Persist modal state in URL for shareable links (when key is provided)
 * - Clean URL when key is omitted
 *
 * The hook returns state values and control functions, but does NOT wrap the ResponsiveModal
 * component itself. This prevents component recreation on state changes and eliminates flickering
 * when switching between views.
 *
 * @template T - Array of view names as readonly string literals (e.g., ['name', 'picture'])
 *
 * @param options - Configuration options for the modal
 * @param options.key - URL query parameter key (e.g., 'profile-update' → ?profile-update=name). If provided, uses URL state; if omitted, uses local state.
 * @param options.views - Array of view names. Defaults to ['show'] for simple modals. No need for "as const" annotation.
 * @param options.defaultView - View to open by default. Defaults to first view
 * @param options.onOpen - Callback when modal opens
 * @param options.onClose - Callback when modal closes
 *
 * @returns Object containing modal state and control functions
 *
 * @example
 * // Modal with URL state (shareable, persistent)
 * const { isOpen, open, close } = useResponsiveModal({
 *   key: 'confirm', // Adds ?confirm=show to URL
 * });
 *
 * return (
 *   <ResponsiveModal open={isOpen} onOpenChange={close}>
 *     <ResponsiveModal.Header>
 *       <ResponsiveModal.Title>Confirm Action</ResponsiveModal.Title>
 *     </ResponsiveModal.Header>
 *   </ResponsiveModal>
 * );
 *
 * @example
 * // Modal with local state (no URL pollution)
 * const { isOpen, open, close } = useResponsiveModal({
 *   // No key = local state with useState
 * });
 *
 * @example
 * // Multi-view modal with URL state
 * const { view, open, close, setView, View } = useResponsiveModal({
 *   key: 'profile',
 *   views: ['name', 'picture'], // Automatically inferred as const!
 *   defaultView: 'name',
 * });
 *
 * return (
 *   <ResponsiveModal open={!!view} onOpenChange={close}>
 *     <View name="name">
 *       <ResponsiveModal.Header>
 *         <ResponsiveModal.Title>Update Name</ResponsiveModal.Title>
 *       </ResponsiveModal.Header>
 *       <ResponsiveModal.Footer>
 *         <Button onClick={() => setView('picture')}>Next</Button>
 *       </ResponsiveModal.Footer>
 *     </View>
 *     <View name="picture">
 *       <ResponsiveModal.Header>
 *         <ResponsiveModal.Title>Update Picture</ResponsiveModal.Title>
 *       </ResponsiveModal.Header>
 *       <ResponsiveModal.Footer>
 *         <Button onClick={() => setView('name')}>Back</Button>
 *       </ResponsiveModal.Footer>
 *     </View>
 *   </ResponsiveModal>
 * );
 */
export function useResponsiveModal<const T extends readonly string[] = ['show']>(
    options: ModalOptions<T>
): ModalReturn<T> {
    const views = (options.views || ['show']) as T;
    const defaultView = options.defaultView || views[0];
    const useUrlState = !!options.key; // Use URL state if key is provided

    // URL state (nuqs) - only initialized if key is provided
    const [urlView, setUrlView] = useQueryState<T[number]>(
        options.key || 'modal',
        parseAsStringLiteral(views)
    );

    // Local state (useState)
    const [localView, setLocalView] = useState<T[number] | null>(null);

    // Use appropriate state based on whether key was provided
    const view = useUrlState ? urlView : localView;
    const _setView = useUrlState ? setUrlView : setLocalView;

    /**
     * Open the modal to a specific view.
     * @param targetView - The view to open, if not provided, the default view is opened.
     */
    const open = useCallback(
        (targetView?: T[number]) => {
            const viewToOpen = targetView || defaultView;
            _setView(viewToOpen);
            options.onOpen?.(viewToOpen);
        },
        [defaultView, _setView, options]
    );

    /**
     * Close the modal.
     */
    const close = useCallback(() => {
        _setView(null);
        options.onClose?.();
    }, [_setView, options]);

    /**
     * Set the view to a specific view.
     * @param newView - The view to set.
     */
    const setView = useCallback(
        (newView: T[number]) => {
            _setView(newView);
        },
        [_setView]
    );

    /**
     * Reset the view to the default view.
     */
    const resetView = useCallback(() => {
        _setView(defaultView);
    }, [defaultView, _setView]);

    /**
     * Toggle the modal open state.
     */
    const toggle = useCallback(() => {
        if (view) {
            close();
        } else {
            open();
        }
    }, [view, close, open]);

    /**
     * Component that renders the content of the modal view.
     * @param name - The name of the view to render.
     * @param children - The content of the view.
     * @returns The rendered content of the view.
     */
    const View = useCallback(
        ({ name, children }: { name: T[number] | null; children: ReactNode }) => {
            if (name && view !== name) return null;
            return <>{children}</>;
        },
        [view]
    );

    return {
        isOpen: !!view,
        view,
        open,
        close,
        setView,
        resetView,
        toggle,
        View,
    };
}
