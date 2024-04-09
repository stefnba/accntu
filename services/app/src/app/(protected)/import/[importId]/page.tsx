interface Props {
    params: {
        importId: string;
    };
}

export default async function OneImport({ params: { importId } }: Props) {
    return (
        <div>
            <h1>Import {importId}</h1>
        </div>
    );
}
