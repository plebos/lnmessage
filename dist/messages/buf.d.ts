/// <reference types="node" />
import { Buffer } from 'buffer';
/**
 * BufferReader class is used to simplify reading information from a Buffer
 */
export declare class BufferReader {
    /**
     * Returns the number of bytes that will be used to encode
     * a BigSize number. BigSize is defined in Lightning Network BOLT 07
     */
    static bigSizeBytes(num: bigint): number;
    private _buffer;
    private _position;
    private _lastReadBytes;
    /**
     * Constructs a reader from the supplied Buffer
     */
    constructor(buffer: Buffer);
    /**
     * Gets or sets the current position of the cursor in the buffer
     */
    get position(): number;
    set position(val: number);
    /**
     * Gets if the cursor is at the end of file.
     */
    get eof(): boolean;
    /**
     * Gets the underlying buffer that the cursor
     * is reading from.
     */
    get buffer(): Buffer;
    /**
     * Number of bytes read in last operation executed on the cursor.
     * Especially useful for operations that return variable length of
     * results such as readBytes or readVarUint.
     */
    get lastReadBytes(): number;
    readUInt8(): number;
    readUInt16LE(): number;
    readUInt16BE(): number;
    readUInt32LE(): number;
    readUInt32BE(): number;
    /**
     * Read a UInt64 number as big-endian
     */
    readUInt64BE(): bigint;
    /**
     * Read a UInt64 number as little-endian
     */
    readUInt64LE(): bigint;
    /**
     * Reads a variable length unsigned integer as specified in the protocol
     * documentation and aways returns a BN to maintain a consistant call
     * signature.
     *
     * @remarks
     * Specified in:
     * https://en.bitcoin.it/wiki/Protocol_documentation#Variable_length_integer
     *
     * Reads the first byte and determines the length of the remaining integer.
     * < 0xfd = 1 byte number
     *   0xfd = 2 byte number (3 bytes total)
     *   0xfe = 4 byte number (5 bytes total)
     *   0xff = 8 byte number (9 bytes total)
     */
    readVarUint(): bigint | void;
    /**
     * Reads a variable length unsigned integer as specified in the Lightning Network
     * protocol documentation and always returns a BigInt to maintain a consistent
     * call signature.
     *
     * @remarks
     * Specified in:
     * https://github.com/lightningnetwork/lightning-rfc/blob/master/01-messaging.md#appendix-a-bigsize-test-vectors
     *
     * < 0xfd = 1 byte number
     *   0xfd = 2 byte number (3 bytes total)
     *   0xfe = 4 byte number (5 bytes total)
     *   0xff = 8 byte number (9 bytes total)
     */
    readBigSize(): bigint;
    /**
     * Read bytes from the buffer into a new Buffer. Unlike the default
     * slice method, the values do not point to the same memory location
     * as the source buffer. The values are copied to a new buffer.
     *
     * @param len optional number of bytes to read, returns
     * all remaining bytes when omitted
     */
    readBytes(len?: number): Buffer;
    /**
     * Reads bytes from the buffer at the current position without
     * moving the cursor.
     * @param len optional number of bytes to read
     */
    peakBytes(len?: number): Buffer;
    /**
     * TLV 0 to 2 byte unsigned integer encoded in big-endian.
     */
    readTUInt16(): number;
    /**
     * TLV 0 to 4 byte unsigned integer encoded in big-endian.
     */
    readTUInt32(): number;
    /**
     * TLV 0 to 8 byte unsigned integer encoded in big-endian.
     */
    readTUInt64(): bigint;
    private _readStandard_old;
    private _readStandard;
    /**
     * Ensures the TUInt value is minimally encoded
     * @param num
     * @param bytes
     */
    private _assertMinimalTUInt;
}
/**
 * Utility class for writing arbitrary data into a Buffer. This class will
 * automatically expand the underlying Buffer and return a trimmed view
 * when complete.
 */
export declare class BufferWriter {
    private _position;
    private _fixed;
    private _buffer;
    /**
     * Constructs a BufferWriter that can optionally wrap an existing Buffer.
     * If no buffer is provided, the BufferWriter will internally manage an
     * exponentially growing Buffer to allow writing of data of an unknown size.
     *
     * If a Buffer is provided, writing that would overflow will throw an
     * exception.
     * @param buffer
     */
    constructor(buffer?: Buffer);
    /**
     * Gets the current size of the output Buffer
     */
    get size(): number;
    /**
     * Returns the Buffer which will be either the full Buffer if this was a
     * fixed Buffer or will be the expandable Buffer sliced to the current
     * position
     */
    toBuffer(): Buffer;
    writeUInt8(value: number): void;
    writeUInt16LE(value: number): void;
    writeUInt16BE(value: number): void;
    writeUInt32LE(value: number): void;
    writeUInt32BE(value: number): void;
    /**
     * Write at the current positiion
     * @param value
     */
    writeUInt64LE(value: number | bigint): void;
    /**
     * Write at the current positiion
     * @param value
     */
    writeUInt64BE(value: number | bigint): void;
    /**
     * Write bytes at the current positiion
     * @param buffer
     */
    writeBytes(buffer: Buffer): void;
    /**
     * Reads a variable length unsigned integer in little-endian as specified in
     * the Bitcoin protocol documentation.
     *
     * < 0xfd = 1 byte number
     *   0xfd = 2 byte number (3 bytes total)
     *   0xfe = 4 byte number (5 bytes total)
     *   0xff = 8 byte number (9 bytes total)
     */
    writeVarInt(val: bigint | number): void;
    /**
     * Reads a variable length unsigned integer as specified in the Lightning Network
     * protocol documentation and always returns a BigInt to maintain a consistent
     * call signature.
     *
     * @remarks
     * Specified in:
     * https://github.com/lightningnetwork/lightning-rfc/blob/master/01-messaging.md#appendix-a-bigsize-test-vectors
     *
     * < 0xfd = 1 byte number
     *   0xfd = 2 byte number (3 bytes total)
     *   0xfe = 4 byte number (5 bytes total)
     *   0xff = 8 byte number (9 bytes total)
     */
    writeBigSize(val: bigint | number): void;
    /**
     * TLV 0 to 2 byte unsigned integer encoded in big-endian.
     * @param val
     */
    writeTUInt16(val: number): void;
    /**
     * TLV 0 to 4 byte unsigned integer encoded in big-endian.
     */
    writeTUInt32(val: number): void;
    /**
     * TLV 0 to 8 byte unsigned integer encoded in big-endian.
     */
    writeTUInt64(val: bigint): void;
    /**
     * Expands the underlying buffer as needed by doubling the size of the
     * Buffer when it needs to grow.
     * @param needed
     */
    private _expand;
    /**
     * Helper for writing to the buffer using built-in write
     * functions
     * @param fn name of function
     * @param val number to write
     * @param len length of number in bytes
     */
    private _writeStandard_old;
    private _writeStandard;
}
