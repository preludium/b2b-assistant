import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Octokit } from 'octokit';

import type { File } from '../types';

require('dayjs/locale/pl');
dayjs.locale('pl');

export class CommitService {
    private readonly octokit: Octokit;

    constructor() {
        this.octokit = new Octokit({
            auth: this.githubToken,
        });
    }

    get githubToken() {
        return Bun.env.GITHUB_TOKEN;
    }

    get githubRepositories() {
        return Bun.env.GITHUB_REPOSITORIES?.split(',');
    }

    get filename() {
        return Bun.env.COMMITS_FILENAME;
    }

    private getUsername() {
        return this.octokit.rest.users.getAuthenticated()
            .then(response => response.data.login);
    }
    
    async getGitHubRepoCommits(owner: string, repo: string) {
        return this.octokit.rest.repos.listCommits({
            owner,
            repo,
            author: await this.getUsername(),
            since: dayjs().startOf('month').toISOString(),
            until: dayjs().endOf('month').toISOString(),
        })
            .then(({ data }) => data.map(element => ([
                repo,
                element.sha,
                dayjs(element.commit.author?.date)
                    .format('DD.MM.YYYY HH:mm'),
                element.commit.author?.name ?? '',
            ])));
    }

    async createCommitsPdf(): Promise<File> {
        const doc = new jsPDF();
    
        console.log(`[${CommitService.name}] Fetching commits`);
    
        const body = (await Promise.all(
            (this.githubRepositories ?? []).map(repository => {
                const [owner, repo] = repository.split('/');
                if (!owner || !repo) {
                    throw new Error(`Wrong repository name format "${repository}", expected "owner/repo"`);
                }

                return this.getGitHubRepoCommits(owner, repo);
            }),
        )).flatMap(repositoryList => repositoryList);

        console.log(`[${CommitService.name}] Creating table`);

        autoTable(doc, {
            head: [['Repo', 'Program', 'Data', 'Developer']],
            body,
        });

        console.log(`[${CommitService.name}] Finished`);

        return {
            name: this.filename ?? 'Commits',
            content: Buffer.from(doc.output('arraybuffer')),
        };
    }
}
