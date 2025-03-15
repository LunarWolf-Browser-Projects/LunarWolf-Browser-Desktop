export function getToolbarStyles(): string {
    return `
        body {
            margin: 0;
            padding: 0;
            background-color: rgb(255, 255, 255);
            display: flex;
            align-items: center;
            height: 100%;
            font-family: Arial, sans-serif;
            overflow: hidden;
            box-sizing: border-box;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .toolbar {
            display: flex;
            align-items: center;
            width: 100%;
            max-width: 100%; /* Ensure the toolbar doesn't overflow */
            height: 100%;
            padding: 0 10px 0 4px; /* Further reduced left padding to move buttons left */
            box-sizing: border-box;
        }

        .toolbar-button {
            width: 36px;
            height: 28px;
            background-color: transparent;
            border: none;
            padding: 0; /* Ensure no padding */
            margin: 0 -0.7px; /* Small negative margin for a tiny gap */
            cursor: pointer;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .toolbar-button:hover {
            background-color: rgba(168, 167, 167, 0.1);
        }

        .toolbar-button:disabled {
            opacity: 0.3; /* Gray out the button */
            cursor: not-allowed; /* Change cursor to indicate it's not clickable */
        }

        .toolbar-button img {
            width: 18px;
            height: 18px;
        }

        /* Add margin-right to the reload button */
        #refreshButton {
            margin-right: 9px;
        }

        .address-bar-container {
            flex-grow: 1;
            display: flex;
            align-items: center;
            position: relative;
            height: 30px; 
            border: 1px solid #ccc;
            border-radius: 16px;
            padding-left: 32px;
            box-sizing: border-box;
            backdrop-filter: blur(1px);
            transform: translateZ(0);
            margin-top: 1px; /* Adjusted to move the address bar up slightly */
        }

        .address-bar-button {
            position: absolute;
            left: 8px;
            width: 24px;
            height: 24px;
            background-color: transparent;
            border: none;
            padding: 0; /* Ensure no padding */
            margin: 0; /* Ensure no margin */
            cursor: pointer;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: translateZ(0);
        }

        .address-bar-button:hover {
            background-color: rgba(168, 167, 167, 0.1);
        }

        .address-bar-button img {
            width: 14px; /* Reduced icon size */
            height: 14px; /* Reduced icon size */
        }

        .address-bar {
            flex-grow: 1;
            height: 100%;
            padding: 2px 8px 0 4px; /* Increased top padding to move text down slightly */
            border: none;
            font-size: 13px; /* Reduced font size */
            outline: none;
            width: 100%;
            box-sizing: border-box;
            background-color: transparent;
        }

        .address-bar:focus {
            border: none;
            outline: none;
            box-shadow: none;
        }

        .address-bar-container:focus-within {
            border-color: #1a73e8;
            box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
        }

        #optionsButton {
            margin-left: 12px;
            flex-shrink: 0; /* Prevent the button from moving */
        }
    `;
}