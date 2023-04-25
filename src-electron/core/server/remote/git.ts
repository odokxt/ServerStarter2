import {
  Failable,
  failabilify,
  isFailure,
  isSuccess,
} from 'src-electron/api/failable';
import { SimpleGit, simpleGit } from 'simple-git';
import { Path } from '../../utils/path/path';
import { GitRemote } from 'src-electron/api/schema';

const DEFAULT_REMOTE_NAME = 'serversterter';

// TODO: ログの追加

export function getRemoteUrl(remote: GitRemote, pat: string) {
  return `https://${remote.owner}:${pat}@github.com/${remote.owner}/${remote.repo}`;
}

export async function isGitRipository(git: SimpleGit, local: Path) {
  const topLevelStr = await failabilify((...args) => git.revparse(...args))([
    '--show-toplevel',
  ]);
  if (isFailure(topLevelStr)) return topLevelStr;
  const topLevel = new Path(topLevelStr);
  return topLevel.str() === local.str();
}

/**
 * 該当するリモートの名称を取得する
 * 該当するリモートが無ければ新しく追加する
 */
export async function getRemoteName(
  git: SimpleGit,
  remote: GitRemote,
  pat: string
): Promise<Failable<string>> {
  const url = getRemoteUrl(remote, pat);
  const remotes = await failabilify(() => git.getRemotes(true))();
  if (isFailure(remotes)) return remotes;

  const names = new Set<string>();

  // すでにリモートが存在する場合
  for (let remote of remotes) {
    const matchFetch = remote.refs.fetch === url;
    const matchPush = remote.refs.push === url;
    if (matchFetch && matchPush) return remote.name;
    names.add(remote.name);
  }

  // 新しくリモートを登録する
  // リモート名を決定
  let remotename = DEFAULT_REMOTE_NAME;
  let i = 0;
  while (names.has(remotename)) {
    remotename = `${DEFAULT_REMOTE_NAME}${i}`;
    i += 1;
  }

  const result = await failabilify(() => git.addRemote(remotename, url))();
  if (isFailure(result)) result;

  return remotename;
}

export async function pull(local: Path, remote: GitRemote, pat: string) {
  if (!local.exists()) local.mkdir(true);
  const git = simpleGit(local.str());
  const exists = await isGitRipository(git, local);
  if (exists) {
    // 該当のリモート名称を取得
    const remoteName = await getRemoteName(git, remote, pat);
    // 該当のリモート名称の取得に成功した場合
    if (isSuccess(remoteName)) {
      // pullを実行
      const pullResult = await failabilify(() =>
        git.pull(remoteName, remote.branch)
      )();
      // pullに成功した場合
      if (isSuccess(pullResult)) return undefined;
    }
  }

  // うまくいかなかった場合ディレクトリを消してclone
  await local.remove(true);
  await local.mkdir();

  // cloneを実行
  const url = getRemoteUrl(remote, pat);
  const cloneOptions = [
    '-b',
    remote.branch,
    '-o',
    DEFAULT_REMOTE_NAME,
    '--single-branch',
    '--depth=1',
  ];
  const cloneResult = await failabilify(() =>
    git.clone(url, local.str(), cloneOptions)
  )();

  if (isFailure(cloneResult)) return cloneResult;

  return undefined;
}
