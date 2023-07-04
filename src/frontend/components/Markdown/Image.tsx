import { ImageProps } from "next/image";
import { FC, useEffect, useState } from "react";
import { FileBlobStorage, ImageBlobStorage } from "@/utils/blobStorage";
export const Image: FC<ImageProps> = ({ ...props }) => {
    const [src, setSrc] = useState<string>();
    useEffect(() => {
        (async () => {
            // first, check if src starts with https:// or http://
            if (props.src.startsWith('https://') || props.src.startsWith('http://')) {
                setSrc(props.src);
                return;
            }
            const blobStorage = await FileBlobStorage;
            if (await blobStorage.isBlobExist(props.src as string)) {
                const url = await blobStorage.getBlobUrl(props.src as string);
                setSrc(url);
            }
            else{
                setSrc(props.src as string);
            }
        })();
    }, []);

    return <img {...props} src={src} />;
}

export const Anchor: FC<{href: string}> = ({ ...props }) => {
    const [href, setHref] = useState<string>();
    useEffect(() => {
        (async () => {
            // first, check if src starts with https:// or http://
            if (props.href.startsWith('https://') || props.href.startsWith('http://')) {
                setHref(props.href);
                return;
            }

            const blobStorage = await FileBlobStorage;
            if (await blobStorage.isBlobExist(props.href as string)) {
                const url = await blobStorage.getBlobUrl(props.href as string);
                setHref(url);
            }
            else{
                setHref(props.href as string);
            }
        })();
    }
    , []);

    return <a {...props} href={href} />;
}
