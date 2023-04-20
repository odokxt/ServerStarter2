import { Path } from '../../utils/path/path';
import { Failable, isSuccess } from '../../../api/failable';
import { forgeVersionLoader } from './forge';
import { JavaComponent, vanillaVersionLoader } from './vanilla';

const ids = [
  '1.19.4',
  '1.19.2',
  '1.19.1',
  '1.19',
  '1.18.2',
  '1.18.1',
  '1.18',
  '1.17.1',
  '1.16.5',
  '1.16.4',
  '1.16.3',
  '1.16.2',
  '1.16.1',
  '1.15.2',
  '1.15.1',
  '1.15',
  '1.14.4',
  '1.14.3',
  '1.14.2',
  '1.13.2',
  '1.12.2',
  '1.12.1',
  '1.12',
  '1.11.2',
  '1.11',
  '1.10.2',
  '1.10',
  '1.9.4',
  '1.9',
  '1.8.9',
  '1.8.8',
  '1.8',
  '1.7.10_pre4',
  '1.7.10',
  '1.7.2',
  '1.6.4',
  '1.6.3',
  '1.6.2',
  '1.6.1',
  '1.5.2',
  '1.5.1',
  '1.5',
  '1.4.7',
  '1.4.6',
  '1.4.5',
  '1.4.4',
  '1.4.3',
  '1.4.2',
  '1.4.1',
  '1.4.0',
  '1.3.2',
  '1.2.5',
  '1.2.4',
  '1.2.3',
  '1.1',
];

describe('vanillaVersion', async () => {
  test(
    '',
    async () => {
      // const result = await readyVanillaVersion(versionsPath.child('vanilla'), {
      //   type: 'vanilla',
      //   id: '1.19.2',
      //   release: true,
      // });
      // console.log(result, 100);
      // const promisses: Promise<
      //   Failable<{
      //     programArguments: string[];
      //     serverCwdPath: Path;
      //     component: JavaComponent;
      //   }>
      // >[] = [];
      // ids.forEach((id) =>
      //   promisses.push(
      //     forgeVersionLoader.readyVersion({ release: true, type: 'forge', id })
      //   )
      // );

      // (await Promise.all(promisses)).forEach((x) => console.log(x));
      const versions = await vanillaVersionLoader.getAllVersions();

      const path = new Path('test.txt');
      if (isSuccess(versions)) {
        path.writeText(JSON.stringify(versions));
      }
      expect(1).toBe(1);
    },
    { timeout: 2 ** 31 - 1 }
  );
});