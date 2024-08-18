# PokéRogue Data Importer

## Project Overview

This is a third-party project designed to process data from the PokéRogue game. The data source for this project is the official PokéRogue code. This project is built using Next.js, a React framework for production-grade applications.

- Official PokéRogue game: [https://pokerogue.net/](https://pokerogue.net/)
- Third-party PokeDex website based on this project: [https://pokeroguegame.net/](https://pokeroguegame.net/)

## License

This project adheres to the same license as the PokéRogue project, which is AGPL-3.0 (GNU Affero General Public License v3.0). For more details, please refer to the [LICENSE](LICENSE) file.

## Usage Instructions

### Prerequisites

1. Clone this repository to your local machine.
2. Ensure you have Node.js and npm installed.

### Installation and Running

1. Create the necessary data tables using the `/sql/ddl.sql` file.

2. Install project dependencies:
   ```
   npm install
   ```

3. Run the project in development mode:
   ```
   npm run dev
   ```

4. Access `localhost:3000/api/XXX` to execute related content. Replace `XXX` with the specific API route you want to access.

### Uploading Images to R2 (Optional)

If you need to upload images to R2:

1. Create a CloudFlare account.
2. Create an R2 bucket.
3. Create a worker.
4. Paste the content from `/worker/worker.js` into your worker.

## Data Sources

- Game data source: [https://github.com/pagefaultgames/pokerogue](https://github.com/pagefaultgames/pokerogue)
- Some data processing logic referenced from: [https://github.com/ydarissep/PokeRogue-Pokedex](https://github.com/ydarissep/PokeRogue-Pokedex)

## Acknowledgments

Special thanks to:
- Pagefault Games development team
- ydarissep

## Disclaimer

This is an unofficial, fan-made project and is not affiliated with or endorsed by the official PokéRogue game or its developers.