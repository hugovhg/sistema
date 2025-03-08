import fs from 'fs';
import path from 'path';
import { sync } from 'rimraf';
import webpackPaths from '../configs/webpack.paths';

export default function deleteSourceMaps() {
  if (fs.existsSync(webpackPaths.distMainPath))
    sync(path.join(webpackPaths.distMainPath, '*.js.map'), {
      glob: true,
    });
  if (fs.existsSync(webpackPaths.distRendererPath))
    sync(path.join(webpackPaths.distRendererPath, '*.js.map'), {
      glob: true,
    });
}
