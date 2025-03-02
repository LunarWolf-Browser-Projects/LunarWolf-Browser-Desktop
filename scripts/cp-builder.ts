import { execSync } from 'child_process';
import * as path from 'path';
import ProgressBar from 'progress';

const buildApp = () => {
  try {
    const appPath = path.resolve(__dirname, '..');
    console.log(`Building from: ${appPath}`);

    // Create a progress bar
    const bar = new ProgressBar('Building project [:bar] :percent :etas', {
      total: 100,
      width: 40,
      complete: '=',
      incomplete: ' ',
      renderThrottle: 100,
    });

    // Simulate progress during the build process
    let progress = 0;

    // Function to update progress bar
    const updateProgress = (increment: number) => {
      progress += increment;
      bar.update(progress / 100);
    };

    // Step 1: Build main
    console.log('Building main...');
    execSync('yarn build-main', {
      stdio: 'inherit',
      cwd: appPath,
    });
    updateProgress(50); // After main is built, update progress

    // Step 2: Build renderer
    console.log('Building renderer...');
    execSync('yarn build-renderer', {
      stdio: 'inherit',
      cwd: appPath,
    });
    updateProgress(50); // After renderer is built, update progress

    console.log('Build process complete!');
  } catch (error) {
    console.error('Error during build process:', error);
    process.exit(1);
  }
};

buildApp();
