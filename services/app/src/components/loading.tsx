export const LoadingBouncer = () => {
    return (
        <div className="flex space-x-1 justify-center items-center bg-white dark:invert">
            <span className="sr-only">Loading...</span>
            <div className="size-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s] duration-700"></div>
            <div className="size-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s] duration-700"></div>
            <div className="size-3 bg-primary rounded-full animate-bounce duration-700"></div>
        </div>
    );
};
