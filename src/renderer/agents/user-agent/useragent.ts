import os from 'os';

export function generateUserAgent(): string {
    // Hardcode the Chromium version to v134
    const chromiumVersion = '134.0.0.0'; // Hardcoded Chromium version

    // Get the operating system information dynamically
    const platform = process.platform;
    const osRelease = os.release();

    let platformString: string;

    switch (platform) {
        case 'win32': {
            // Windows: Extract major version and use "Windows NT" format
            const winVersion = osRelease.split('.')[0]; // Major version
            platformString = `Windows NT ${winVersion}.0; Win64; x64`;
            break;
        }
        case 'darwin': {
            // macOS: Format version as "Macintosh; Intel Mac OS X 10_15_7"
            const macVersion = osRelease.split('.').slice(0, 2).join('_'); // Format "10_15" or "11_6"
            platformString = `Macintosh; Intel Mac OS X ${macVersion}`;
            break;
        }
        case 'linux': {
            // Linux: Use X11 and include architecture
            platformString = `X11; Linux ${os.arch()}`;
            break;
        }
        default: {
            // Unknown platform
            platformString = 'Unknown';
            break;
        }
    }

    // Construct the user agent string
    const userAgent = `Mozilla/5.0 (${platformString}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromiumVersion} Safari/537.36`;

    // Debugging: Log the final user agent string
    console.log('Generated User Agent:', userAgent);

    return userAgent;
}

// Export the default user agent for easy access
export const defaultUserAgent = generateUserAgent();