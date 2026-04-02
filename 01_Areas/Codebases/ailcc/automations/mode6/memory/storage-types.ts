export interface StorageProvider {
    init(): Promise<void>;
    save(key: string, data: any): Promise<boolean>;
    load<T>(key: string): Promise<T | null>;
    delete(key: string): Promise<boolean>;
    listKeys(pattern?: string): Promise<string[]>;
}

export interface VectorProvider {
    upsert(id: string, vector: number[], metadata: any): Promise<void>;
    query(vector: number[], topK: number): Promise<any[]>;
}
