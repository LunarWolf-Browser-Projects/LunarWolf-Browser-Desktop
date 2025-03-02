![LunarWolf Banner](static/app_banner/app_banner_refined.png)

LunarWolf Browser is a custom Electron-based web browser designed with a modular UI, and browser approach, It features a custom-built tab system and browser container.

## Features
- **Multi-tab browsing** with a custom tab management system
- **Electron-based rendering**
- **Minimalist and user-friendly UI**
- **Customizable browsing experience**

> NOTE; we are working to find an alternitive to using the <webviewtag> in electron as its in an odd stat at the moment, but it still serves as a placeholder and can render all modern web pages as of writing this.

> ANOTHER THING TO NOTE: this project is in very early stages, which means its marked unstable untill prior notice.

## instructions
1. Clone the repository:
   ```sh
   git clone https://github.com/LunarWolf-Browser-Projects/LunarWolf-Browser-Desktop.git
   ```
2. Install dependencies:
   ```sh
   yarn install
   ```
3. build the application:
   ```sh
   yarn run build
   ```
4. Run the application:
   ```sh
   yarn run start.
   ```

## Contributing
Contributions are welcome!

## License
This project is licensed under `MIT` See the `LICENSE` file for details.

## Acknowledgments
- some of the code within this project was from another project, for those peices of code all credit goes to them and there work, theres some original stuff in here tho, you can see contributions to there work (they did not have no involvment with this project) i just used some of there code as a placeholder, which can be found in the `tabbar.ts` and `tabbarstyle.css` files located within the renderer.
