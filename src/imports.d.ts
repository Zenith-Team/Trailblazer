declare global {
    /**
     * @custom `require` but with intellisense for native modules.
     *
     * Don't use for local files (except JSON), use the normal `import` for those. */
    function Import(specifier: 'electron'): typeof import('electron');
    function Import(specifier: 'tachyon'): typeof import ('tachyon');
    function Import(specifier: 'assert'): typeof import('assert');
    function Import(specifier: 'assert/strict'): typeof import('assert/strict');
    function Import(specifier: 'async_hooks'): typeof import('async_hooks');
    function Import(specifier: 'buffer'): typeof import('buffer');
    function Import(specifier: 'child_process'): typeof import('child_process');
    function Import(specifier: 'cluster'): typeof import('cluster');
    function Import(specifier: 'console'): typeof import('console');
    function Import(specifier: 'constants'): typeof import('constants');
    function Import(specifier: 'crypto'): typeof import('crypto');
    function Import(specifier: 'dgram'): typeof import('dgram');
    function Import(specifier: 'diagnostics_channel'): typeof import('diagnostics_channel');
    function Import(specifier: 'dns'): typeof import('dns');
    function Import(specifier: 'dns/promises'): typeof import('dns/promises');
    function Import(specifier: 'domain'): typeof import('domain');
    function Import(specifier: 'events'): typeof import('events');
    function Import(specifier: 'fs'): typeof import('fs');
    function Import(specifier: 'fs/promises'): typeof import('fs/promises');
    function Import(specifier: 'http'): typeof import('http');
    function Import(specifier: 'http2'): typeof import('http2');
    function Import(specifier: 'https'): typeof import('https');
    function Import(specifier: 'inspector'): typeof import('inspector');
    function Import(specifier: 'module'): typeof import('module');
    function Import(specifier: 'net'): typeof import('net');
    function Import(specifier: 'os'): typeof import('os');
    function Import(specifier: 'path'): typeof import('path');
    function Import(specifier: 'path/posix'): typeof import('path/posix');
    function Import(specifier: 'path/win32'): typeof import('path/win32');
    function Import(specifier: 'perf_hooks'): typeof import('perf_hooks');
    function Import(specifier: 'process'): typeof import('process');
    function Import(specifier: 'punycode'): typeof import('punycode');
    function Import(specifier: 'querystring'): typeof import('querystring');
    function Import(specifier: 'readline'): typeof import('readline');
    function Import(specifier: 'readline/promises'): typeof import('readline/promises');
    function Import(specifier: 'repl'): typeof import('repl');
    function Import(specifier: 'stream'): typeof import('stream');
    function Import(specifier: 'stream/consumers'): typeof import('stream/consumers');
    function Import(specifier: 'stream/promises'): typeof import('stream/promises');
    function Import(specifier: 'stream/web'): typeof import('stream/web');
    function Import(specifier: 'string_decoder'): typeof import('string_decoder');
    function Import(specifier: 'sys'): typeof import('sys');
    function Import(specifier: 'timers'): typeof import('timers');
    function Import(specifier: 'timers/promises'): typeof import('timers/promises');
    function Import(specifier: 'tls'): typeof import('tls');
    function Import(specifier: 'trace_events'): typeof import('trace_events');
    function Import(specifier: 'tty'): typeof import('tty');
    function Import(specifier: 'url'): typeof import('url');
    function Import(specifier: 'util'): typeof import('util');
    function Import(specifier: 'util/types'): typeof import('util/types');
    function Import(specifier: 'v8'): typeof import('v8');
    function Import(specifier: 'vm'): typeof import('vm');
    function Import(specifier: 'wasi'): typeof import('wasi');
    function Import(specifier: 'worker_threads'): typeof import('worker_threads');
    function Import(specifier: 'zlib'): typeof import('zlib');
    function Import(specifier: `${string}.json`): Record<string, any>;


}

export {};
