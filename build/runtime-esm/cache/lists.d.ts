import { SubscriptionSelection, ListWhen, SubscriptionSpec } from '../types';
import { Cache } from './cache';
export declare class ListManager {
    rootID: string;
    constructor(rootID: string);
    lists: Map<string, Map<string, ListCollection>>;
    private listsByField;
    get(listName: string, id?: string): ListCollection;
    remove(listName: string, id: string): void;
    add(list: {
        name: string;
        connection: boolean;
        cache: Cache;
        recordID: string;
        key: string;
        listType: string;
        selection: SubscriptionSelection;
        when?: ListWhen;
        filters?: List['filters'];
        parentID: SubscriptionSpec['parentID'];
    }): void;
    removeIDFromAllLists(id: string): void;
    deleteField(parentID: string, field: string): void;
}
export declare class List {
    readonly recordID: string;
    readonly key: string;
    readonly listType: string;
    private cache;
    readonly selection: SubscriptionSelection;
    private _when?;
    private filters?;
    readonly name: string;
    readonly parentID: string;
    private connection;
    private manager;
    constructor({ name, cache, recordID, key, listType, selection, when, filters, parentID, connection, manager, }: Parameters<ListManager['add']>[0] & {
        manager: ListManager;
    });
    when(when?: ListWhen): ListCollection;
    append(selection: SubscriptionSelection, data: {}, variables?: {}): void;
    prepend(selection: SubscriptionSelection, data: {}, variables?: {}): void;
    addToList(selection: SubscriptionSelection, data: {}, variables: {}, where: 'first' | 'last'): void;
    removeID(id: string, variables?: {}): boolean;
    remove(data: {}, variables?: {}): boolean;
    validateWhen(when?: ListWhen): boolean;
    toggleElement(selection: SubscriptionSelection, data: {}, variables: {}, where: 'first' | 'last'): void;
    [Symbol.iterator](): Generator<string, void, unknown>;
}
export declare class ListCollection {
    lists: List[];
    constructor(lists: List[]);
    append(...args: Parameters<List['append']>): void;
    prepend(...args: Parameters<List['prepend']>): void;
    addToList(...args: Parameters<List['addToList']>): void;
    removeID(...args: Parameters<List['removeID']>): void;
    remove(...args: Parameters<List['remove']>): void;
    toggleElement(...args: Parameters<List['toggleElement']>): void;
    when(when?: ListWhen): ListCollection;
    includes(key: string): boolean;
    deleteListWithKey(key: string): List[];
    [Symbol.iterator](): Generator<string, void, unknown>;
}
