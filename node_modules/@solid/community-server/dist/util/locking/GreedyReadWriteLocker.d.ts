import type { ResourceIdentifier } from '../../http/representation/ResourceIdentifier';
import type { KeyValueStorage } from '../../storage/keyvalue/KeyValueStorage';
import type { ReadWriteLocker } from './ReadWriteLocker';
import type { ResourceLocker } from './ResourceLocker';
export interface GreedyReadWriteSuffixes {
    count: string;
    read: string;
    write: string;
}
/**
 * A {@link ReadWriteLocker} that allows for multiple simultaneous read operations.
 * Write operations will be blocked as long as read operations are not finished.
 * New read operations are allowed while this is going on, which will cause write operations to wait longer.
 *
 * Based on https://en.wikipedia.org/wiki/Readers%E2%80%93writer_lock#Using_two_mutexes .
 * As soon as 1 read lock request is made, the write lock is locked.
 * Internally a counter keeps track of the amount of active read locks.
 * Only when this number reaches 0 will the write lock be released again.
 * The internal read lock is only locked to increase/decrease this counter and is released afterwards.
 * This allows for multiple read operations, although only 1 at the time can update the counter,
 * which means there can still be a small waiting period if there are multiple simultaneous read operations.
 */
export declare class GreedyReadWriteLocker implements ReadWriteLocker {
    private readonly locker;
    private readonly storage;
    private readonly suffixes;
    /**
     * @param locker - Used for creating read and write locks.
     * @param storage - Used for storing the amount of active read operations on a resource.
     * @param suffixes - Used to generate identifiers with the given suffixes.
     *                   `count` is used for the identifier used to store the counter.
     *                   `read` and `write` are used for the 2 types of locks that are needed.
     */
    constructor(locker: ResourceLocker, storage: KeyValueStorage<string, number>, suffixes?: GreedyReadWriteSuffixes);
    withReadLock<T>(identifier: ResourceIdentifier, whileLocked: () => (Promise<T> | T)): Promise<T>;
    withWriteLock<T>(identifier: ResourceIdentifier, whileLocked: () => (Promise<T> | T)): Promise<T>;
    /**
     * This key is used for storing the count of active read operations.
     */
    private getCountKey;
    /**
     * This is the identifier for the read lock: the lock that is used to safely update and read the count.
     */
    private getReadLockKey;
    /**
     * This is the identifier for the write lock, making sure there is at most 1 write operation active.
     */
    private getWriteLockKey;
    /**
     * Safely updates the count before starting a read operation.
     */
    private preReadSetup;
    /**
     * Safely decreases the count after the read operation is finished.
     */
    private postReadCleanup;
    /**
     * Safely runs an action on the count.
     */
    private withInternalReadLock;
    /**
     * Updates the count with the given modifier.
     * Creates the data if it didn't exist yet.
     * Deletes the data when the count reaches zero.
     */
    private incrementCount;
}
