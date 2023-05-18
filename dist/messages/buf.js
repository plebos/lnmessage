import { Buffer } from 'buffer';
/**
 * BufferReader class is used to simplify reading information from a Buffer
 */
export class BufferReader {
    /**
     * Returns the number of bytes that will be used to encode
     * a BigSize number. BigSize is defined in Lightning Network BOLT 07
     */
    static bigSizeBytes(num) {
        if (num < BigInt(0xfd))
            return 1;
        if (num < BigInt(0x10000))
            return 3;
        if (num < BigInt(0x100000000))
            return 5;
        else
            return 9;
    }
    _buffer;
    _position;
    _lastReadBytes;
    /**
     * Constructs a reader from the supplied Buffer
     */
    constructor(buffer) {
        this._buffer = buffer;
        this._position = 0;
        this._lastReadBytes = 0;
    }
    /**
     * Gets or sets the current position of the cursor in the buffer
     */
    get position() {
        return this._position;
    }
    set position(val) {
        this._position = val;
    }
    /**
     * Gets if the cursor is at the end of file.
     */
    get eof() {
        return this._position === this._buffer.length;
    }
    /**
     * Gets the underlying buffer that the cursor
     * is reading from.
     */
    get buffer() {
        return this._buffer;
    }
    /**
     * Number of bytes read in last operation executed on the cursor.
     * Especially useful for operations that return variable length of
     * results such as readBytes or readVarUint.
     */
    get lastReadBytes() {
        return this._lastReadBytes;
    }
    readUInt8() {
        return this._readStandard(Buffer.prototype.readUInt8, 1);
    }
    readUInt16LE() {
        return this._readStandard(Buffer.prototype.readUInt16LE, 2);
    }
    readUInt16BE() {
        return this._readStandard(Buffer.prototype.readUInt16BE, 2);
    }
    readUInt32LE() {
        return this._readStandard(Buffer.prototype.readUInt32LE, 2);
    }
    readUInt32BE() {
        return this._readStandard(Buffer.prototype.readUInt32BE, 2);
    }
    /**
     * Read a UInt64 number as big-endian
     */
    readUInt64BE() {
        return BigInt('0x' + this.readBytes(8).toString('hex'));
    }
    /**
     * Read a UInt64 number as little-endian
     */
    readUInt64LE() {
        return BigInt('0x' + this.readBytes(8).reverse().toString('hex'));
    }
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
    readVarUint() {
        const size = this.readUInt8();
        if (size < 0xfd) {
            this._lastReadBytes = 1;
            return BigInt(size);
        }
        switch (size) {
            case 0xfd:
                this._lastReadBytes = 3;
                return BigInt(this.readUInt16LE());
            case 0xfe:
                this._lastReadBytes = 5;
                return BigInt(this.readUInt32LE());
            case 0xff:
                this._lastReadBytes = 9;
                return this.readUInt64LE();
        }
    }
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
    readBigSize() {
        const size = this.readUInt8();
        if (size < 0xfd) {
            this._lastReadBytes = 1;
            return BigInt(size);
        }
        switch (size) {
            case 0xfd: {
                this._lastReadBytes = 3;
                const val = this.readUInt16BE();
                if (val < 0xfd)
                    throw new Error('decoded varint is not canonical');
                return BigInt(val);
            }
            case 0xfe: {
                this._lastReadBytes = 5;
                const val = this.readUInt32BE();
                if (val < 0x10000)
                    throw new Error('decoded varint is not canonical');
                return BigInt(val);
            }
            case 0xff: {
                this._lastReadBytes = 9;
                const val = this.readUInt64BE();
                if (val < BigInt(0x100000000))
                    throw new Error('decoded varint is not canonical');
                return val;
            }
            default:
                throw new Error(`Unrecognised size: ${size} when trying to read BigSize`);
        }
    }
    /**
     * Read bytes from the buffer into a new Buffer. Unlike the default
     * slice method, the values do not point to the same memory location
     * as the source buffer. The values are copied to a new buffer.
     *
     * @param len optional number of bytes to read, returns
     * all remaining bytes when omitted
     */
    readBytes(len) {
        if (len === 0) {
            this._lastReadBytes = 0;
            return Buffer.alloc(0);
        }
        else if (typeof len === 'number' && len > 0) {
            if (this._position + len > this._buffer.length) {
                throw new RangeError('Index out of range');
            }
            const slice = this._buffer.subarray(this._position, this._position + len);
            const result = Buffer.alloc(slice.length, slice);
            this._position += len;
            this._lastReadBytes = len;
            return result;
        }
        else {
            if (this._position === this._buffer.length) {
                this._lastReadBytes = 0;
                return Buffer.alloc(0);
            }
            const slice = this._buffer.subarray(this._position);
            const result = Buffer.alloc(slice.length, slice);
            this._position = this._buffer.length;
            this._lastReadBytes = result.length;
            return result;
        }
    }
    /**
     * Reads bytes from the buffer at the current position without
     * moving the cursor.
     * @param len optional number of bytes to read
     */
    peakBytes(len) {
        if (len === 0) {
            return Buffer.alloc(0);
        }
        else if (typeof len === 'number' && len > 0) {
            if (this._position + len > this._buffer.length) {
                throw new RangeError('Index out of range');
            }
            const slice = this._buffer.subarray(this._position, this._position + len);
            const result = Buffer.alloc(slice.length, slice);
            return result;
        }
        else {
            if (this._position === this._buffer.length)
                throw new RangeError('Index out of range');
            const slice = this._buffer.subarray(this._position);
            const result = Buffer.alloc(slice.length, slice);
            return result;
        }
    }
    /**
     * TLV 0 to 2 byte unsigned integer encoded in big-endian.
     */
    readTUInt16() {
        const size = Math.min(2, this._buffer.length - this._position);
        if (size === 0)
            return 0;
        const val = this._buffer.readUIntBE(this._position, size);
        this._assertMinimalTUInt(BigInt(val), size);
        this._position += size;
        return val;
    }
    /**
     * TLV 0 to 4 byte unsigned integer encoded in big-endian.
     */
    readTUInt32() {
        const size = Math.min(4, this._buffer.length - this._position);
        if (size === 0)
            return 0;
        const val = this._buffer.readUIntBE(this._position, size);
        this._assertMinimalTUInt(BigInt(val), size);
        this._position += size;
        return val;
    }
    /**
     * TLV 0 to 8 byte unsigned integer encoded in big-endian.
     */
    readTUInt64() {
        const size = Math.min(8, this._buffer.length - this._position);
        if (size === 0)
            return BigInt(0);
        const hex = this._buffer.subarray(this._position, this._position + size).toString('hex') || '0';
        const val = BigInt('0x' + hex);
        this._assertMinimalTUInt(val, size);
        this._position += size;
        return val;
    }
    _readStandard_old(fn, len) {
        if (this._position + len > this._buffer.length) {
            throw new RangeError('Index out of range');
        }
        const result = fn.call(this._buffer, this._position);
        this._position += len;
        this._lastReadBytes = len;
        return result;
    }
    _readStandard(fn, len) {
        if (this._position + len > this._buffer.length) {
            throw new RangeError('Index out of range');
        }
        const result = fn.call(this._buffer, this._position);
        this._position += len;
        this._lastReadBytes = len;
        return result;
    }
    /**
     * Ensures the TUInt value is minimally encoded
     * @param num
     * @param bytes
     */
    _assertMinimalTUInt(num, bytes) {
        const msg = 'TUInt not minimal';
        for (let i = 0; i < 9; i++) {
            if (num < BigInt('0x1' + ''.padStart(i * 2, '0'))) {
                if (bytes !== i) {
                    throw new Error(msg);
                }
            }
        }
    }
}
/**
 * Utility class for writing arbitrary data into a Buffer. This class will
 * automatically expand the underlying Buffer and return a trimmed view
 * when complete.
 */
export class BufferWriter {
    _position;
    _fixed;
    _buffer;
    /**
     * Constructs a BufferWriter that can optionally wrap an existing Buffer.
     * If no buffer is provided, the BufferWriter will internally manage an
     * exponentially growing Buffer to allow writing of data of an unknown size.
     *
     * If a Buffer is provided, writing that would overflow will throw an
     * exception.
     * @param buffer
     */
    constructor(buffer) {
        this._position = 0;
        this._fixed = !!buffer;
        this._buffer = buffer || Buffer.alloc(0);
    }
    /**
     * Gets the current size of the output Buffer
     */
    get size() {
        return this._position;
    }
    /**
     * Returns the Buffer which will be either the full Buffer if this was a
     * fixed Buffer or will be the expandable Buffer sliced to the current
     * position
     */
    toBuffer() {
        if (this._fixed)
            return this._buffer;
        else
            return this._buffer.subarray(0, this._position);
    }
    writeUInt8(value) {
        this._writeStandard(Buffer.prototype.writeUInt8, value, 1);
    }
    writeUInt16LE(value) {
        this._writeStandard(Buffer.prototype.writeUInt16LE, value, 2);
    }
    writeUInt16BE(value) {
        this._writeStandard(Buffer.prototype.writeUInt16BE, value, 2);
    }
    writeUInt32LE(value) {
        this._writeStandard(Buffer.prototype.writeUInt32LE, value, 2);
    }
    writeUInt32BE(value) {
        this._writeStandard(Buffer.prototype.writeUInt32BE, value, 2);
    }
    /**
     * Write at the current positiion
     * @param value
     */
    writeUInt64LE(value) {
        const val = BigInt(value);
        if (val < 0 || val >= BigInt(2) ** BigInt(64)) {
            throw new RangeError(`The value of "value" is out of range. It must be >= 0 and <= 18446744073709551615. Received ${value.toString()}`);
        }
        const buf = Buffer.from(val.toString(16).padStart(16, '0'), 'hex');
        this.writeBytes(buf.reverse());
    }
    /**
     * Write at the current positiion
     * @param value
     */
    writeUInt64BE(value) {
        const val = BigInt(value);
        if (val < 0 || val >= BigInt(2) ** BigInt(64)) {
            throw new RangeError(`The value of "value" is out of range. It must be >= 0 and <= 18446744073709551615. Received ${value.toString()}`);
        }
        const buf = Buffer.from(val.toString(16).padStart(16, '0'), 'hex');
        this.writeBytes(buf);
    }
    /**
     * Write bytes at the current positiion
     * @param buffer
     */
    writeBytes(buffer) {
        if (!buffer || !buffer.length)
            return;
        this._expand(buffer.length);
        buffer.copy(this._buffer, this._position);
        this._position += buffer.length;
    }
    /**
     * Reads a variable length unsigned integer in little-endian as specified in
     * the Bitcoin protocol documentation.
     *
     * < 0xfd = 1 byte number
     *   0xfd = 2 byte number (3 bytes total)
     *   0xfe = 4 byte number (5 bytes total)
     *   0xff = 8 byte number (9 bytes total)
     */
    writeVarInt(val) {
        const num = BigInt(val);
        if (num < BigInt(0xfd)) {
            this.writeUInt8(Number(num));
        }
        else if (num < BigInt(0x10000)) {
            this.writeUInt8(0xfd);
            this.writeUInt16LE(Number(num));
        }
        else if (num < BigInt(0x100000000)) {
            this.writeUInt8(0xfe);
            this.writeUInt32LE(Number(num));
        }
        else {
            this.writeUInt8(0xff);
            this.writeUInt64LE(num);
        }
    }
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
    writeBigSize(val) {
        const num = BigInt(val);
        if (num < BigInt(0xfd)) {
            this.writeUInt8(Number(num));
        }
        else if (num < BigInt(0x10000)) {
            this.writeUInt8(0xfd);
            this.writeUInt16BE(Number(num));
        }
        else if (num < BigInt(0x100000000)) {
            this.writeUInt8(0xfe);
            this.writeUInt32BE(Number(num));
        }
        else {
            this.writeUInt8(0xff);
            this.writeUInt64BE(num);
        }
    }
    /**
     * TLV 0 to 2 byte unsigned integer encoded in big-endian.
     * @param val
     */
    writeTUInt16(val) {
        if (val === 0)
            return;
        const size = val > 0xff ? 2 : 1;
        this._expand(size);
        this._buffer.writeUIntBE(val, this._position, size);
        this._position += size;
    }
    /**
     * TLV 0 to 4 byte unsigned integer encoded in big-endian.
     */
    writeTUInt32(val) {
        if (val === 0)
            return;
        const size = val > 0xffffff ? 4 : val > 0xffff ? 3 : val > 0xff ? 2 : 1;
        this._expand(size);
        this._buffer.writeUIntBE(val, this._position, size);
        this._position += size;
    }
    /**
     * TLV 0 to 8 byte unsigned integer encoded in big-endian.
     */
    writeTUInt64(val) {
        if (val === BigInt(0))
            return;
        let valString = val.toString(16);
        if (valString.length % 2 === 1)
            valString = '0' + valString;
        const buf = Buffer.from(valString, 'hex');
        this.writeBytes(buf);
    }
    /**
     * Expands the underlying buffer as needed by doubling the size of the
     * Buffer when it needs to grow.
     * @param needed
     */
    _expand(needed) {
        const required = this._position + needed;
        // Ensure that a fixed Buffer length is not violated
        if (this._fixed && required > this._buffer.length) {
            throw new RangeError('Out of range');
        }
        // expand the buffer if the current buffer is insufficiently lengthed
        if (this._buffer.length < required) {
            // calculate the new length based on the required length and some
            // maths where we determine the number of bytes required and at the
            // next power of 2.
            const newLen = 1 << Math.ceil(Math.log2(required));
            const newBuf = Buffer.alloc(newLen);
            // copy the old data to the new buffer and then dispose of the old
            // buffer
            this._buffer.copy(newBuf);
            this._buffer = newBuf;
        }
    }
    /**
     * Helper for writing to the buffer using built-in write
     * functions
     * @param fn name of function
     * @param val number to write
     * @param len length of number in bytes
     */
    _writeStandard_old(fn, val, len) {
        console.log('_writeStandard is calling: ', fn);
        this._expand(len);
        // @ts-ignore
        this._buffer[fn](val, this._position);
        this._position += len;
    }
    _writeStandard(fn, val, len) {
        this._expand(len);
        fn.call(this._buffer, val, this._position);
        this._position += len;
    }
}
//# sourceMappingURL=buf.js.map