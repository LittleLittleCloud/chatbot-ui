export interface IBlobStorage
{
    saveBlob(blob: Blob, name: string): Promise<void>;
    getBlob(name: string): Promise<Blob>;
    deleteBlob(name: string): Promise<void>;
    listBlobs(): Promise<string[]>;
    isBlobExist(name: string): Promise<boolean>;
}

export class IndexDBBlobStorage implements IBlobStorage
{
    private blobs: Record<string, Blob> = {};

    async saveBlob(blob: Blob, name: string): Promise<void> {
        this.blobs[name] = blob;
    }

    async getBlob(name: string): Promise<Blob> {
        return this.blobs[name];
    }

    async deleteBlob(name: string): Promise<void> {
        delete this.blobs[name];
    }

    async listBlobs(): Promise<string[]> {
        return Object.keys(this.blobs);
    }

    async isBlobExist(name: string): Promise<boolean> {
        return name in this.blobs;
    }
}