import { ImageProps } from "next/image";
import { FC, useEffect, useState } from "react";
import { ImageBlobStorage } from "@/utils/blobStorage";
export const Image: FC<ImageProps> = ({ ...props }) => {
    const [src, setSrc] = useState<string>();
    useEffect(() => {
        (async () => {
            const imageBlobStorage = await ImageBlobStorage;
            if (await imageBlobStorage.isBlobExist(props.src as string)) {
                const url = await imageBlobStorage.getBlobUrl(props.src as string);
                setSrc(url);
            }
            else{
                setSrc(props.src as string);
            }
        })();
    }, []);

    return <img {...props} src={src} />;
}
