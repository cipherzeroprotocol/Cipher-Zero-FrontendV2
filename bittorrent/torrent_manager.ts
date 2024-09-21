import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';
import { create } from 'node:domain';
// Removed import of 'create' from 'node:domain'

var torrentStream = require('torrent-stream');

var engine = torrentStream('magnet:my-magnet-link');

engine.on('ready', function() {
	engine.files.forEach(function(file: { name: any; createReadStream: () => any; }) {
		console.log('filename:', file.name);
		var stream = file.createReadStream();
		// stream is readable stream to containing the file content
	});
});


// get a stream containing bytes 10-100 inclusive.
var stream = engine.files[0].createReadStream({
  start: 10,
  end: 100
});


export class BitTorrentManager {
  initialize() {
    throw new Error('Method not implemented.');
  }
  cleanup() {
    throw new Error('Method not implemented.');
  }
  private engine: any;

  constructor() {
    this.engine = null;
  }

  // Start seeding a file
  public seed(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(filePath)) {
        return reject(new Error('File does not exist'));
      }

      const file = fs.createReadStream(filePath);
      const torrent = torrentStream();

      this.engine = torrent;
      torrent.on('listening', () => {
        logger.info(`Seeding ${filePath} on port ${torrent.port}`);
        resolve(torrent.infoHash);
      });

      torrent.on('error', (err: Error) => {
        logger.error('Error while seeding:', err);
        reject(err);
      });

      torrent.addFile(filePath, (file: any) => {
        logger.info(`Added ${filePath} to torrent`);
        file.select(); // Selects the file to be uploaded
      });
    });
  }

  // Download a torrent using a magnet link
  public download(magnetURI: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.engine) {
        return reject(new Error('A download is already in progress'));
      }

      this.engine = create();

      this.engine.on('ready', () => {
        logger.info('Download started...');
        this.engine.on('download', (file: any) => {
          const outputPath = path.join(__dirname, file.name);
          file.createReadStream().pipe(fs.createWriteStream(outputPath));
          logger.info(`Downloading ${file.name}`);
        });

        this.engine.on('done', () => {
          logger.info('Download completed');
          resolve();
        });
      });

      this.engine.on('error', (err: Error) => {
        logger.error('Error while downloading:', err);
        reject(err);
      });
    });
  }

  // Stop seeding or downloading
  public stop(): void {
    if (this.engine) {
      this.engine.destroy();
      logger.info('Stopped seeding/downloading');
      this.engine = null;
    }
  }
}
