type A = ({
    data,
    user
}: {
    data: Record<string, unknown>;
    user: string;
}) => void;
type B = (b: 'a') => void;
type C = ({ data }: { data: Record<string, unknown> }) => void;
type D = ({ user }: { user: string }) => void;
type E = () => void;

type Union = A & B & C & D & E;

declare const fn: Union;

fn({ data: {} });
fn({ data: {}, user: 'ddd' });
fn({ user: 'ddd' });
fn();

// const hallo: Union = ({ user, data }) => {};

function nein(a: Union) {
    a('a');
}
