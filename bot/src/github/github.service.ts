import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { UpdateFilePayload } from './github.interface';

@Injectable()
export class GithubService {
  async updateFile(payload: UpdateFilePayload) {
    const { token, repo, path, content, message } = payload;
    const url = `https://api.github.com/repos/${repo}/contents/${path}`;

    const getResponse = await fetch(url, {
      headers: {
        Authorization: `token ${token}`,
      },
    });

    const getFileData = await getResponse.json();
    const sha = getFileData.sha;

    const base64Content = Buffer.from(content).toString('base64');
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: base64Content,
        sha,
      }),
    });

    return response.json();
  }
}
