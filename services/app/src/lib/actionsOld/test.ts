export type A = ({ user, params }: { user: string; params: number }) => void;
export type B = ({ user }: { user: string }) => void;
export type C = ({ params }: { params: number }) => void;
export type D = () => void;

type Inter = A & B & C & D;
type Un = A | B | C | D;

// export type UnionToIntersection<U> = (
//     U extends any ? (k: U) => void : never
// ) extends (k: infer I) => void
//     ? I
//     : never;

type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (
    x: infer R
) => any
    ? R
    : never;

type Union = ({
    user,
    params
}: {
    user: string;
    params: number;
}) => void | (() => void);

type AAA = UnionToIntersection<Union>;

type BT<T> = T extends void ? (arg: T) => any : never;

function test(voi: () => void, hi: 'open'): void;
function test(
    voi: ({ user, params }: { user: string; params: number }) => void,
    hi?: 'auth'
): void;
function test(voi: Union, hi: 'auth' | 'open' = 'auth'): void {}

const aaa = test(({ params, user }) => {}, 'auth');

export type AA = ({ user, params }: { user: string; params: number }) => void;
export type BB = () => void;

const isAA = (test: AA | BB, basdf: 'e' | 'd' = 'd'): test is AA => {
    return basdf === 'd';
};
const isBB = (test: AA | BB, basdf: 'e' | 'd' = 'd'): test is BB => {
    return basdf === 'e';
};

const asfasdf = (test: AA | BB) => {
    if (isAA(test)) {
        test({ user: 'asdf', params: 1 });
    }
    if (isBB(test)) {
        test();
    }
};
