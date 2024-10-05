import { errorToast, successToast } from '@/components/toast';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';
import { storeUploadImportFiles } from '@/features/import/store/upload-import-files';
import { client } from '@/lib/api/client';
import { computeSHA256 } from '@/server/lib/upload/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { FileWithPath } from 'react-dropzone';

const getUploadUrlQuery = client.api.import.file['upload-url'].create.$post;

/**
 * Get signed url for uploading file.
 */
const getUploadUrl = async (
    values: InferRequestType<typeof getUploadUrlQuery>['json']
) => {
    const response = await getUploadUrlQuery({
        json: values
    });

    if (!response.ok) throw new Error(response.statusText);

    return response.json();
};

/**
 * Upload file to the signed url.
 * @param url
 * @param file
 * @returns
 */
const uploadFile = async (url: string, file: FileWithPath) => {
    return fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type
        }
    })
        .then(async (res) => {
            if (res.ok) {
                return {
                    url: res.url.split('?')[0],
                    type: file.type,
                    filename: file.name
                };
            } else {
                throw new Error(res.statusText);
            }
        })
        .catch((err) => {
            throw err;
        });
};

const createFileCall = client.api.import.file.create.$post;

const createFileRecord = async (
    values: InferRequestType<typeof createFileCall>['json']
) => {
    const response = await createFileCall({
        json: values
    });

    if (!response.ok) throw new Error(response.statusText);

    return response.json();
};

export const useUploadImportFile = () => {
    const { addUploadedFile } = storeUploadImportFiles();

    const q = useMutation<
        InferResponseType<typeof createFileCall>,
        Error,
        { file: FileWithPath; importId: string }
    >({
        mutationFn: async ({ file, importId }) => {
            const values = {
                checksum: await computeSHA256(file),
                fileSize: file.size,
                fileType: file.type
            };

            // get signed url
            const { url: uploadUrl } = await getUploadUrl(values);
            // upload file
            const { url: remoteUrl } = await uploadFile(uploadUrl, file);
            // create db record for the uploaded file
            const fileRecord = await createFileRecord({
                url: remoteUrl,
                type: file.type,
                filename: file.name,
                importId
            });

            return fileRecord;
        },
        onError: (error) => {
            errorToast(error.message);
        },
        onSuccess: (data) => {
            // add successfully uploaded file to store
            console.log('add', data);
            addUploadedFile(data.id);
        }
    });

    return q;
};
