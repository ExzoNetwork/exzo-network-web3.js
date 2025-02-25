import { IJsonRpcTransport } from '.';
import { makeHttpRequest } from './http-request';
import { SolanaJsonRpcError } from './json-rpc-errors';
import { createJsonRpcMessage } from './json-rpc-message';

type Config = Readonly<{
    url: string;
}>;

type JsonRpcResponse<TResponse> = Readonly<
    { result: TResponse } | { error: { code: number; message: string; data?: unknown } }
>;

export function createJsonRpcTransport({ url }: Config): IJsonRpcTransport {
    return {
        async send<TParams, TResponse>(method: string, params: TParams): Promise<TResponse> {
            const jsonRpcMessage = createJsonRpcMessage(method, params);
            const response = await makeHttpRequest<JsonRpcResponse<TResponse>>({
                payload: jsonRpcMessage,
                url,
            });
            if ('error' in response) {
                throw new SolanaJsonRpcError(response.error);
            } else {
                return response.result as TResponse;
            }
        },
    };
}
