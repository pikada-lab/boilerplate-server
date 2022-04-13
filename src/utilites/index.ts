export interface DataAccessService {
    request<T>(name: string, sql: string): Promise<T>;
    createEntity<T>(name: string, dataAccessObject: any): Promise<T>;
    deleteEntity(name: string, id: number): Promise<boolean>;
    updateEntity(name: string, id: number, dataAccessObject: any): Promise<boolean>;
    select<T>(name: string, id?: number): Promise<T>;
}