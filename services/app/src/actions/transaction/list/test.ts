type Entries<T> = {
    [K in keyof T]: [K, T[K]];
}[keyof T][];

function entriesFromObject<T extends object>(object: T): Entries<T> {
    return Object.entries(object) as Entries<T>;
}

const hallp = {
    account: ['1', '2'],
    label: ['3', '4', null],
    title: 'asdfl'
};

const aasdf = entriesFromObject(hallp).map(([key, value]) => {
    console.log(key, value);

    if (Array.isArray(value) && value.some((v) => v === null)) {
    }
});
