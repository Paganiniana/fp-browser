import { Socket } from "net"
import { TLSSocket } from "tls";

export type SocketCommOptions = {
    host:string,
    port: string,
    tls: boolean,
    value: Uint8Array
}

/**
 * @returns {Buffer} the host's response
 */
export function getDataBySocket(options: SocketCommOptions): Promise<Buffer> {
    // 1. create appropriate socket
    console.log("Creating socket")
    const client:Socket = options.tls ? new TLSSocket(new Socket()) : new Socket();

    // 2. setup promise with appropriate events
    const p:Promise<Buffer> = new Promise((resolve, reject) => {
        console.log("Setting up promise...", options)
        let success = false;
        // a. start the connection
        client.on("connect", () => {
            console.log("Getting started...")
            client.write(options.value)
        })

        // b. resolve with buffer
        client.on("data", (b:Buffer) => {
            success = true;
            resolve(b);
        })

        // c. reject on close if we haven't succeeded
        client.on("close", () => {
            if (!success) 
                reject("The hose closed our connection before we received the response")
        })

        // d. reject on error & timeout
        client.on("error", () => reject("The host closed our connection with an error"));
        client.on("timeout", () => reject("Our connection to the host timed out"));
    })

    // 3. start the connection
    client.connect({
        host: options.host,
        port: Number(options.port),
    })

    // 4. return the promise
    return p;
}